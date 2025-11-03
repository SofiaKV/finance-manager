/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import { Category } from '../types';
import { categories } from '../data/categories.data';

@Injectable()
export class CategoriesService {
  async getCategories(): Promise<Category[]> {
    return categories;
  }
}
