import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CotisationsController } from './cotisations.controller';
import { CotisationsService } from './cotisations.service';
import { Cotisation } from './entities/cotisation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cotisation])],
  controllers: [CotisationsController],
  providers: [CotisationsService],
  exports: [CotisationsService],
})
export class CotisationsModule {}









