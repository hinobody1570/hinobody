import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BlockModule } from './block/block.module';
import { BoardModule } from './board/board.module';
import { BoardMemberModule } from './board-member/board-member.module';
import { CommentModule } from './comment/comment.module';
import { ImageModule } from './image/image.module';
import { PostModule } from './post/post.module';
import { ReportModule } from './report/report.module';
import { UserModule } from './user/user.module';
import { S3Module } from './s3/s3.module';
import { EmailModule } from './email/email.module';
import { EyeMaskedImageModule } from './eye-masked-image/eye-masked-image.module';
import { VoteModule } from './vote/vote.module';
import { SearchModule } from './search/search.module';
import { BoardCategoryModule } from './board-category/board-category.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }) as any,
    PrismaModule,
    EmailModule,
    UserModule,
    AuthModule,
    BlockModule,
    BoardModule,
    BoardMemberModule,
    BoardCategoryModule,
    CommentModule,
    ImageModule,
    PostModule,
    ReportModule,
    S3Module,
    EyeMaskedImageModule,
    VoteModule,
    SearchModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
