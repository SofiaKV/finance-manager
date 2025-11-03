import { promises as fs } from 'fs';
import { join } from 'path';

const DATA_DIR = join(__dirname, '../../data-storage');

export class FileStorage {
  private static async ensureDataDir(): Promise<void> {
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
  }

  static async save<T>(filename: string, data: T): Promise<void> {
    await this.ensureDataDir();
    const filePath = join(DATA_DIR, `${filename}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  static async load<T>(filename: string, defaultValue: T): Promise<T> {
    try {
      await this.ensureDataDir();
      const filePath = join(DATA_DIR, `${filename}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content) as T;
    } catch {
      // File doesn't exist or is corrupted, return default value
      return defaultValue;
    }
  }

  static saveSync<T>(filename: string, data: T): void {
    // Non-blocking save - don't await
    this.save(filename, data).catch((err) =>
      console.error(`Failed to save ${filename}:`, err),
    );
  }
}
