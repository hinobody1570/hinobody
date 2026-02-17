import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BoardMemberStatus, BoardVisibility } from '@prisma/client';

@Injectable()
export class BoardMemberService {
  constructor(private prisma: PrismaService) {}

  /**
   * Join a board - handles different visibility access types
   */
  async joinBoard(boardId: string, userId: string) {
    // Check if board exists
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: { creator: true },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    if (!board.isActive) {
      throw new BadRequestException('Board is not active');
    }

    // Check if user is already a member
    const existingMembership = await this.prisma.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId,
          boardId,
        },
      },
    });

    if (existingMembership) {
      if (existingMembership.status === 'APPROVED') {
        throw new ConflictException('You are already a member of this board');
      } else if (existingMembership.status === 'PENDING') {
        throw new ConflictException('Your request to join is pending approval');
      } else if (existingMembership.status === 'REJECTED') {
        // Allow re-applying after rejection
        return this.prisma.boardMember.update({
          where: {
            userId_boardId: {
              userId,
              boardId,
            },
          },
          data: {
            status: board.visibilityAccess === BoardVisibility.PUBLIC ? 'APPROVED' : 'PENDING',
          },
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
              },
            },
            board: {
              select: {
                id: true,
                name: true,
                visibilityAccess: true,
              },
            },
          },
        });
      }
    }

    // Determine membership status based on board visibility
    let status: BoardMemberStatus = 'PENDING';
    if (board.visibilityAccess === BoardVisibility.PUBLIC) {
      status = 'APPROVED';
    } else if (board.visibilityAccess === BoardVisibility.PRIVATE || board.visibilityAccess === BoardVisibility.RESTRICTED) {
      status = 'PENDING';
    }

    // Create membership
    const membership = await this.prisma.boardMember.create({
      data: {
        userId,
        boardId,
        status,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
        board: {
          select: {
            id: true,
            name: true,
            visibilityAccess: true,
          },
        },
      },
    });

    return membership;
  }

  /**
   * Check if user is an approved member of a board
   */
  async isMember(boardId: string, userId: string): Promise<boolean> {
    const membership = await this.prisma.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId,
          boardId,
        },
      },
    });

    return membership?.status === 'APPROVED';
  }

  /**
   * Get user's membership status for a board
   */
  async getMembershipStatus(boardId: string, userId: string) {
    const membership = await this.prisma.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId,
          boardId,
        },
      },
      include: {
        board: {
          select: {
            id: true,
            name: true,
            visibilityAccess: true,
          },
        },
      },
    });
    return membership || null;
  }

  /**
   * Approve or reject a membership request (only board creator can do this)
   */
  async updateMembershipStatus(
    boardId: string,
    memberId: string,
    status: BoardMemberStatus,
    userId: string,
  ) {
    // Check if board exists and user is the creator
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    if (board.creatorId !== userId) {
      throw new ForbiddenException('Only the board creator can approve/reject memberships');
    }

    // Check if membership exists
    const membership = await this.prisma.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId: memberId,
          boardId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    // Update membership status
    return this.prisma.boardMember.update({
      where: {
        userId_boardId: {
          userId: memberId,
          boardId,
        },
      },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
        board: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Get pending membership requests for a board (only board creator)
   */
  async getPendingMemberships(boardId: string, userId: string) {
    // Check if board exists and user is the creator
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    if (board.creatorId !== userId) {
      throw new ForbiddenException('Only the board creator can view pending memberships');
    }

    return this.prisma.boardMember.findMany({
      where: {
        boardId,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Leave a board
   */
  async leaveBoard(boardId: string, userId: string) {
    // Check if user is the creator (creators cannot leave)
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    if (board.creatorId === userId) {
      throw new BadRequestException('Board creator cannot leave the board');
    }

    // Check if membership exists
    const membership = await this.prisma.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId,
          boardId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('You are not a member of this board');
    }

    // Delete membership
    await this.prisma.boardMember.delete({
      where: {
        userId_boardId: {
          userId,
          boardId,
        },
      },
    });

    return { message: 'Successfully left the board' };
  }

  /**
   * Get all memberships across all boards (admin only)
   * Pending requests are shown first
   */
  async getAllMemberships() {
    const memberships = await this.prisma.boardMember.findMany({
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            email: true,
            createdAt: true,
          },
        },
        board: {
          select: {
            id: true,
            name: true,
            visibilityAccess: true,
            creator: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // PENDING comes before APPROVED alphabetically
        { createdAt: 'desc' },
      ],
    });

    // Sort manually to ensure PENDING is first
    return memberships.sort((a, b) => {
      if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
      if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  /**
   * Admin: Approve a membership request
   */
  async approveMembership(boardId: string, memberId: string) {
    const membership = await this.prisma.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId: memberId,
          boardId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    return this.prisma.boardMember.update({
      where: {
        userId_boardId: {
          userId: memberId,
          boardId,
        },
      },
      data: { status: 'APPROVED' },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
        board: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Admin: Delete a membership
   */
  async deleteMembership(boardId: string, memberId: string) {
    const membership = await this.prisma.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId: memberId,
          boardId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    await this.prisma.boardMember.delete({
      where: {
        userId_boardId: {
          userId: memberId,
          boardId,
        },
      },
    });

    return { message: 'Membership deleted successfully' };
  }

  /**
   * Admin: Reject a membership request
   */
  async rejectMembership(boardId: string, memberId: string) {
    const membership = await this.prisma.boardMember.findUnique({
      where: {
        userId_boardId: {
          userId: memberId,
          boardId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    return this.prisma.boardMember.update({
      where: {
        userId_boardId: {
          userId: memberId,
          boardId,
        },
      },
      data: { status: 'REJECTED' },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
        board: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}

