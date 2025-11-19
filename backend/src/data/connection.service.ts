import knex from 'knex';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Connection {
  public readonly db: knex.Knex;

  constructor(configService: ConfigService) {
    this.db = knex({
      client: 'pg',
      connection: {
        host: configService.getOrThrow('POSTGRES_HOST'),
        port: configService.getOrThrow<number>('POSTGRES_PORT'),
        user: configService.getOrThrow('POSTGRES_USER'),
        password: configService.getOrThrow('POSTGRES_PASSWORD'),
        database: configService.getOrThrow('POSTGRES_DB'),
      },
      pool: { min: 2, max: 10 },
    });
  }
}
