import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { BlockService } from './block.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('blocks')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createBlockDto: CreateBlockDto, @GetUser('id') userId: string) {
    return this.blockService.create(createBlockDto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@GetUser('id') userId: string) {
    return this.blockService.findAll(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.blockService.findOne(id);
  }

  @Delete(':blockedId')
  @UseGuards(JwtAuthGuard)
  remove(@Param('blockedId') blockedId: string, @GetUser('id') userId: string) {
    return this.blockService.remove(blockedId, userId);
  }
}



