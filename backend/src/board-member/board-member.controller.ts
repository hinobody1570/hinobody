import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BoardMemberService } from './board-member.service';
import { UpdateMembershipDto } from './dto/update-membership.dto';

@ApiTags('Board Members')
@Controller('boards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class BoardMemberController {
  constructor(private readonly boardMemberService: BoardMemberService) {}

  @Post(':boardId/join')
  @ApiOperation({ summary: 'Join a board' })
  @ApiParam({ name: 'boardId', description: 'Board ID to join' })
  @ApiResponse({ status: 201, description: 'Successfully joined or requested to join' })
  @ApiResponse({ status: 404, description: 'Board not found' })
  @ApiResponse({ status: 409, description: 'Already a member or request pending' })
  async joinBoard(
    @Param('boardId') boardId: string,
    @GetUser('id') userId: string,
  ) {
    return this.boardMemberService.joinBoard(boardId, userId);
  }

  @Get(':boardId/membership')
  @ApiOperation({ summary: 'Get user membership status for a board' })
  @ApiParam({ name: 'boardId', description: 'Board ID' })
  @ApiResponse({ status: 200, description: 'Membership status retrieved' })
  async getMembershipStatus(
    @Param('boardId') boardId: string,
    @GetUser('id') userId: string,
  ) {
    return this.boardMemberService.getMembershipStatus(boardId, userId);
  }

  @Get(':boardId/pending-members')
  @ApiOperation({ summary: 'Get pending membership requests (board creator only)' })
  @ApiParam({ name: 'boardId', description: 'Board ID' })
  @ApiResponse({ status: 200, description: 'Pending memberships retrieved' })
  @ApiResponse({ status: 403, description: 'Only board creator can view pending memberships' })
  async getPendingMemberships(
    @Param('boardId') boardId: string,
    @GetUser('id') userId: string,
  ) {
    return this.boardMemberService.getPendingMemberships(boardId, userId);
  }

  @Patch(':boardId/members/:memberId/status')
  @ApiOperation({ summary: 'Approve or reject a membership request (board creator only)' })
  @ApiParam({ name: 'boardId', description: 'Board ID' })
  @ApiParam({ name: 'memberId', description: 'User ID of the member' })
  @ApiResponse({ status: 200, description: 'Membership status updated' })
  @ApiResponse({ status: 403, description: 'Only board creator can approve/reject memberships' })
  async updateMembershipStatus(
    @Param('boardId') boardId: string,
    @Param('memberId') memberId: string,
    @Body() updateMembershipDto: UpdateMembershipDto,
    @GetUser('id') userId: string,
  ) {
    return this.boardMemberService.updateMembershipStatus(
      boardId,
      memberId,
      updateMembershipDto.status,
      userId,
    );
  }

  @Delete(':boardId/leave')
  @ApiOperation({ summary: 'Leave a board' })
  @ApiParam({ name: 'boardId', description: 'Board ID to leave' })
  @ApiResponse({ status: 200, description: 'Successfully left the board' })
  @ApiResponse({ status: 400, description: 'Board creator cannot leave' })
  async leaveBoard(
    @Param('boardId') boardId: string,
    @GetUser('id') userId: string,
  ) {
    return this.boardMemberService.leaveBoard(boardId, userId);
  }
}

