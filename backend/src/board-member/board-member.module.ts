import { Module } from '@nestjs/common';
import { BoardMemberService } from './board-member.service';
import { BoardMemberController } from './board-member.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BoardMemberController],
  providers: [BoardMemberService],
  exports: [BoardMemberService],
})
export class BoardMemberModule {}

