import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { DataModule } from '../data/data.module';

@Module({
  controllers: [CategoriesController],
  imports: [DataModule],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
