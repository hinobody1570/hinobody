import { Module } from '@nestjs/common';
import { EyeMaskedImageService } from './eye-masked-image.service';
import { EyeMaskedImageController } from './eye-masked-image.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EyeMaskedImageController],
  providers: [EyeMaskedImageService],
  exports: [EyeMaskedImageService],
})
export class EyeMaskedImageModule {}

