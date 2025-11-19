import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { DataModule } from '../data/data.module';

@Module({
  controllers: [ReportsController],
  imports: [DataModule],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
