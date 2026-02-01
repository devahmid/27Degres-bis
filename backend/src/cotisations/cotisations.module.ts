import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CotisationsController } from './cotisations.controller';
import { CotisationsService } from './cotisations.service';
import { Cotisation } from './entities/cotisation.entity';
import { MailModule } from '../mail/mail.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cotisation]),
    MailModule,
    UsersModule,
  ],
  controllers: [CotisationsController],
  providers: [CotisationsService],
  exports: [CotisationsService],
})
export class CotisationsModule {}









