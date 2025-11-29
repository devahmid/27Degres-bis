import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
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

// Load .env file manually if it exists
function loadEnvFile() {
  const envPath = path.join(__dirname, '../../.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
}

async function createAdmin() {
  // Load environment variables from .env file
  loadEnvFile();
  
  // Get database connection from environment
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL n\'est pas définie dans les variables d\'environnement');
    process.exit(1);
  }

  const dataSource = new DataSource({
    type: 'postgres',
    url: databaseUrl,
    entities: [
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
    ],
    synchronize: false,
    ssl: databaseUrl.includes('supabase') ? { rejectUnauthorized: false } : false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Connexion à la base de données établie');

    const usersRepository = dataSource.getRepository(User);

    // Check if admin already exists
    const existingAdmin = await usersRepository.findOne({
      where: { email: 'admin@27degres.fr' },
    });

    if (existingAdmin) {
      console.log('⚠️  Un utilisateur existe déjà avec cet email: admin@27degres.fr');
      console.log('   Mise à jour du rôle en admin...');
      existingAdmin.role = 'admin';
      await usersRepository.save(existingAdmin);
      console.log('✅ Rôle admin attribué avec succès !');
      console.log('');
      console.log('📧 Email: admin@27degres.fr');
      console.log('🔑 Vous pouvez vous connecter avec votre mot de passe actuel');
    } else {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = usersRepository.create({
        firstName: 'Admin',
        lastName: '27 Degrés',
        email: 'admin@27degres.fr',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        consentAnnuaire: false,
        consentNewsletter: false,
      });

      await usersRepository.save(admin);
      console.log('✅ Administrateur créé avec succès !');
      console.log('');
      console.log('📧 Email: admin@27degres.fr');
      console.log('🔑 Mot de passe: admin123');
      console.log('');
      console.log('⚠️  IMPORTANT: Changez le mot de passe après la première connexion !');
    }

    await dataSource.destroy();
    console.log('');
    console.log('🎉 Script terminé avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

createAdmin();
