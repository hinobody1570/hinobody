import { Module } from '@nestjs/common';
import { ContactSubmissionService } from './contact-submission.service';
import { ContactSubmissionController } from './contact-submission.controller';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [ContactSubmissionController],
  providers: [ContactSubmissionService],
})
export class ContactSubmissionModule {}

