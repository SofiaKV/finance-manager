import { Module } from '@nestjs/common';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';
import { DataModule } from '../data/data.module';

@Module({
  controllers: [GoalsController],
  imports: [DataModule],
  providers: [GoalsService],
  exports: [GoalsService],
})
export class GoalsModule {}
