import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DataModule } from '../data/data.module';

@Module({
  controllers: [AuthController],
  imports: [DataModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
