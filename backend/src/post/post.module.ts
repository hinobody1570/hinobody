import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BoardMemberModule } from '../board-member/board-member.module';

@Module({
  imports: [PrismaModule, BoardMemberModule],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
