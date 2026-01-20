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
import { QueryReportsDto } from './dto/query-reports.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  create(
    @Body() createReportDto: CreateReportDto,
    @GetUser('id') userId: string,
  ) {
    return this.reportService.create(createReportDto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all reports with pagination, filters, and search' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status', enum: ['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'] })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  findAll(@Query() query: QueryReportsDto) {
    return this.reportService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  findOne(@Param('id') id: string) {
    return this.reportService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
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
  @ApiBearerAuth('JWT-auth')
  remove(@Param('id') id: string) {
    return this.reportService.remove(id);
  }
}
