import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { VoteService } from './vote.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import { QueryVoteDto } from './dto/query-vote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Votes')
@ApiBearerAuth('JWT-auth')
@Controller('votes')
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create, update, or remove a vote',
    description:
      'Creates a new vote, updates existing vote, or removes vote if same type is clicked again',
  })
  @ApiResponse({
    status: 201,
    description: 'Vote created, updated, or removed successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Post or comment not found' })
  createOrUpdateVote(
    @Body() createVoteDto: CreateVoteDto,
    @GetUser('id') userId: string,
  ) {
    return this.voteService.createOrUpdateVote(createVoteDto, userId);
  }

  @Get('user-vote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: "Get user's vote for a post or comment",
    description: 'Returns the vote type (UPVOTE/DOWNVOTE) if user has voted',
  })
  @ApiQuery({
    name: 'postId',
    required: false,
    description: 'Post ID to get vote for',
  })
  @ApiQuery({
    name: 'commentId',
    required: false,
    description: 'Comment ID to get vote for',
  })
  @ApiResponse({
    status: 200,
    description: "User's vote retrieved successfully",
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  getUserVote(
    @Query() query: QueryVoteDto,
    @GetUser('id') userId: string,
  ) {
    return this.voteService.getUserVote(userId, query.postId, query.commentId);
  }
}

