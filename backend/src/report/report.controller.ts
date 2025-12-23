import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ReportStatus } from '@prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  create(@Body() createReportDto: CreateReportDto, @GetUser('id') userId: string) {
    return this.reportService.create(createReportDto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query('status') status?: ReportStatus) {
    return this.reportService.findAll(status);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.reportService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
    @GetUser('id') adminId: string,
    @GetUser('role') role: string,
  ) {
    if (role !== 'ADMIN') {
      throw new Error('Only admins can update reports');
    }
    return this.reportService.update(id, updateReportDto, adminId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.reportService.remove(id);
  }
}



