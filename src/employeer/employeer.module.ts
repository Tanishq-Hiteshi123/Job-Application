import { Module } from '@nestjs/common';
import { EmployeerController } from './employeer.controller';
import { EmployeerService } from './employeer.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [EmployeerController],
  providers: [EmployeerService],
  exports: [EmployeerModule],
})
export class EmployeerModule {}
