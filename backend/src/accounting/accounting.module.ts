import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountingController } from './accounting.controller';
import { AccountingService } from './accounting.service';
import { Expense } from './entities/expense.entity';
import { TreasuryOpeningBalance } from './entities/treasury-opening-balance.entity';
import { CotisationsModule } from '../cotisations/cotisations.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, TreasuryOpeningBalance]),
    CotisationsModule,
    StorageModule,
  ],
  controllers: [AccountingController],
  providers: [AccountingService],
  exports: [AccountingService],
})
export class AccountingModule {}
