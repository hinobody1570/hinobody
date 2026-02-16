import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BoardMemberModule } from '../board-member/board-member.module';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [PrismaModule, BoardMemberModule, S3Module],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
