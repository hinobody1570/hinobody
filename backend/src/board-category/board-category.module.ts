import { Module } from '@nestjs/common';
import { BoardCategoryService } from './board-category.service';
import { BoardCategoryController } from './board-category.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BoardCategoryController],
  providers: [BoardCategoryService],
  exports: [BoardCategoryService],
})
export class BoardCategoryModule {}
