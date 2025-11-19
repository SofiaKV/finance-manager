import { Injectable } from '@nestjs/common';
import { Category } from '../types';
import { CategoryDao } from '../data/categories.data';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoryDao: CategoryDao) {}

  async getCategories(): Promise<Category[]> {
    return this.categoryDao.findAllCategories();
  }
}
