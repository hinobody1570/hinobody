import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ContactSubmissionService } from './contact-submission.service';
import { CreateContactSubmissionDto } from './dto/create-contact-submission.dto';
import { QueryContactSubmissionsDto } from './dto/query-contact-submissions.dto';
import { UpdateContactSubmissionDto } from './dto/update-contact-submission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Contact Submissions')
@Controller('contact-submissions')
export class ContactSubmissionController {
  constructor(private readonly contactSubmissionService: ContactSubmissionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a contact submission (public)' })
  create(@Body() dto: CreateContactSubmissionDto, @Req() req: Request) {
    const forwardedFor = req.headers['x-forwarded-for'];
    const ipFromForwarded =
      typeof forwardedFor === 'string' ? forwardedFor.split(',')[0]?.trim() : undefined;

    const ipAddress = ipFromForwarded || req.ip || null;
    const userAgent = (req.headers['user-agent'] as string | undefined) || null;

    return this.contactSubmissionService.create(dto, { ipAddress, userAgent });
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List contact submissions (admin only)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'priority', required: false })
  @ApiQuery({ name: 'assignedToId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  findAll(@Query() query: QueryContactSubmissionsDto) {
    return this.contactSubmissionService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a contact submission by id (admin only)' })
  findOne(@Param('id') id: string) {
    return this.contactSubmissionService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a contact submission (admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdateContactSubmissionDto) {
    return this.contactSubmissionService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a contact submission (admin only)' })
  remove(@Param('id') id: string) {
    return this.contactSubmissionService.remove(id);
  }
}

