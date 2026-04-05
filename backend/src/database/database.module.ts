import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as dns from 'node:dns/promises';
import { Resolver } from 'node:dns/promises';
import { User } from '../users/entities/user.entity';
import { Cotisation } from '../cotisations/entities/cotisation.entity';
import { Event } from '../events/entities/event.entity';
import { EventRegistration } from '../events/entities/event-registration.entity';
import { EventImage } from '../events/entities/event-image.entity';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../posts/entities/comment.entity';
import { PostTag } from '../posts/entities/post-tag.entity';
import { PostTagRelation } from '../posts/entities/post-tag-relation.entity';
import { Document } from '../documents/entities/document.entity';
import { ContactMessage } from '../contact/entities/contact-message.entity';
import { GalleryImage } from '../gallery/entities/gallery-image.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { DeliveryMethod } from '../orders/entities/delivery-method.entity';
import { Idea } from '../ideas/entities/idea.entity';
import { IdeaVote } from '../ideas/entities/idea-vote.entity';
import { IdeaComment } from '../ideas/entities/idea-comment.entity';
import { Expense } from '../accounting/entities/expense.entity';
import { TreasuryOpeningBalance } from '../accounting/entities/treasury-opening-balance.entity';
import { EventCarpool } from '../events/entities/event-carpool.entity';

/** Parse postgresql://… pour une connexion explicite (meilleur support de family IPv4 avec pg). */
function parsePostgresUrl(urlStr: string): {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
} {
  const u = new URL(urlStr);
  const database = (u.pathname || '/postgres').replace(/^\//, '').split('?')[0] || 'postgres';
  return {
    host: u.hostname,
    port: u.port ? parseInt(u.port, 10) : 5432,
    username: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database,
  };
}

const DEFAULT_PUBLIC_DNS = ['8.8.8.8', '1.1.1.1'];

/**
 * Résout le host en IPv4 (évite ECONNREFUSED si l’IPv6 est filtrée).
 * Le DNS local peut ne pas exposer d’enregistrement A (ENOTFOUND) alors que les DNS publics en ont.
 * TLS côté pg : garder servername = hostname d’origine.
 */
async function resolveSupabaseIpv4Host(
  hostname: string,
  dnsServersCsv?: string,
): Promise<string> {
  try {
    const { address } = await dns.lookup(hostname, { family: 4 });
    return address;
  } catch {
    // fallthrough
  }

  const servers = dnsServersCsv
    ? dnsServersCsv
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : DEFAULT_PUBLIC_DNS;

  const resolver = new Resolver();
  resolver.setServers(servers);
  const addresses = await resolver.resolve4(hostname);
  if (!addresses?.length) {
    throw new Error(`Aucun enregistrement A (IPv4) pour ${hostname}`);
  }
  return addresses[0];
}

function isSupabaseDirectDbHost(hostname: string): boolean {
  return hostname.includes('db.') && hostname.includes('.supabase.co');
}

/** Connexion directe db.* : souvent IPv6-only en DNS ; sans IPv4 ni IPv6 routée, il faut l’URI pooler. */
function supabaseDirectDbNoIpv4Message(hostname: string): string {
  return [
    `Aucun enregistrement DNS IPv4 pour ${hostname} (connexion directe Supabase, souvent IPv6-only).`,
    `Ce réseau refuse la connexion IPv6 (ECONNREFUSED).`,
    `Remplacez DATABASE_URL par l’URI « Session pooler » : Dashboard → Connect (ou Database) → Connection string → Session pooler — user postgres.<project_ref>, hôte aws-0-<région>.pooler.supabase.com.`,
  ].join(' ');
}

const ENTITIES = [
  User,
  Cotisation,
  Event,
  EventRegistration,
  EventImage,
  Post,
  Comment,
  PostTag,
  PostTagRelation,
  Document,
  ContactMessage,
  GalleryImage,
  Product,
  Order,
  OrderItem,
  DeliveryMethod,
  Idea,
  IdeaVote,
  IdeaComment,
  Expense,
  TreasuryOpeningBalance,
  EventCarpool,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const ipv4Flag = configService.get<string>('DATABASE_FORCE_IPV4');
        // Par défaut : IPv4 pour Supabase (souvent bloqué en IPv6 en local). Mettre DATABASE_FORCE_IPV4=false pour désactiver.
        const forceIpv4 =
          ipv4Flag === 'false'
            ? false
            : ipv4Flag === 'true' || (databaseUrl?.includes('supabase') ?? false);
        const pgExtra = forceIpv4 ? { family: 4 as const } : undefined;

        const common = {
          entities: ENTITIES,
          synchronize: configService.get('NODE_ENV') !== 'production',
          logging: configService.get('NODE_ENV') === 'development',
        };

        if (databaseUrl) {
          const isSupabase = databaseUrl.includes('supabase');
          if (forceIpv4) {
            const p = parsePostgresUrl(databaseUrl);
            let host = p.host;
            let ssl: false | { rejectUnauthorized: boolean; servername?: string } = isSupabase
              ? { rejectUnauthorized: false, servername: p.host }
              : false;
            if (isSupabase && isSupabaseDirectDbHost(p.host)) {
              try {
                host = await resolveSupabaseIpv4Host(
                  p.host,
                  configService.get<string>('DATABASE_DNS_SERVERS'),
                );
                ssl = { rejectUnauthorized: false, servername: p.host };
              } catch {
                console.error('[Database]', supabaseDirectDbNoIpv4Message(p.host));
                console.error(
                  '[Database] Repli sur l’URI directe (résolution IPv6) : les connexions échoueront tant que vous n’utilisez pas l’URI Session pooler ci-dessus.',
                );
                return {
                  type: 'postgres',
                  url: databaseUrl,
                  ssl: { rejectUnauthorized: false },
                  ...common,
                };
              }
            }
            return {
              type: 'postgres',
              host,
              port: p.port,
              username: p.username,
              password: p.password,
              database: p.database,
              extra: host === p.host ? pgExtra : undefined,
              ssl,
              ...common,
            };
          }
          return {
            type: 'postgres',
            url: databaseUrl,
            ssl: isSupabase ? { rejectUnauthorized: false } : false,
            ...common,
          };
        }

        const hostCfg = configService.get('DB_HOST', 'localhost');
        let host = hostCfg;
        let ssl: false | { rejectUnauthorized: boolean; servername?: string } = hostCfg.includes('supabase')
          ? { rejectUnauthorized: false, servername: hostCfg }
          : false;
        let skipPgFamily4 = false;
        if (forceIpv4 && isSupabaseDirectDbHost(hostCfg)) {
          try {
            host = await resolveSupabaseIpv4Host(
              hostCfg,
              configService.get<string>('DATABASE_DNS_SERVERS'),
            );
            ssl = { rejectUnauthorized: false, servername: hostCfg };
          } catch {
            console.error('[Database]', supabaseDirectDbNoIpv4Message(hostCfg));
            host = hostCfg;
            ssl = hostCfg.includes('supabase') ? { rejectUnauthorized: false } : false;
            skipPgFamily4 = true;
          }
        }
        return {
          type: 'postgres',
          host,
          port: configService.get('DB_PORT', 5432),
          username: configService.get('DB_USERNAME', 'postgres'),
          password: configService.get('DB_PASSWORD', 'postgres'),
          database: configService.get('DB_NAME', 'asso_27degres'),
          extra: skipPgFamily4 ? undefined : host === hostCfg ? pgExtra : undefined,
          ssl,
          ...common,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
