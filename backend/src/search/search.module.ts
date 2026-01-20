import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PostModule } from '../post/post.module';
import { BoardModule } from '../board/board.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PrismaModule, PostModule, BoardModule, UserModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}

