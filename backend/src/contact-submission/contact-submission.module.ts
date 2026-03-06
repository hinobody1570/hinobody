import { Module } from '@nestjs/common';
import { ContactSubmissionService } from './contact-submission.service';
import { ContactSubmissionController } from './contact-submission.controller';

@Module({
  controllers: [ContactSubmissionController],
  providers: [ContactSubmissionService],
})
export class ContactSubmissionModule {}

