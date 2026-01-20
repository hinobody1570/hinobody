import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import { VoteType, Prisma } from '@prisma/client';

@Injectable()
export class VoteService {
  constructor(private prisma: PrismaService) {}

  async createOrUpdateVote(
    createVoteDto: CreateVoteDto,
    userId: string,
  ): Promise<any> {
    const { type, postId, commentId } = createVoteDto;

    // Validate that either postId or commentId is provided, but not both
    if (!postId && !commentId) {
      throw new BadRequestException(
        'Either postId or commentId must be provided',
      );
    }

    if (postId && commentId) {
      throw new BadRequestException(
        'Cannot vote on both post and comment simultaneously',
      );
    }

    // Verify post or comment exists
    if (postId) {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });
      if (!post) {
        throw new NotFoundException('Post not found');
      }
    }

    if (commentId) {
      const comment = await this.prisma.comment.findUnique({
        where: { id: commentId },
      });
      if (!comment) {
        throw new NotFoundException('Comment not found');
      }
    }

    // Check if user already has a vote
    const existingVote = await this.prisma.vote.findFirst({
      where: {
        userId,
        ...(postId ? { postId } : { commentId }),
      },
    });

    let vote;
    let voteCountChange = { upvoteCount: 0, downvoteCount: 0 };

    if (existingVote) {
      // If user is voting the same type, remove the vote
      if (existingVote.type === type) {
        // Delete the vote
        await this.prisma.vote.delete({
          where: { id: existingVote.id },
        });

        // Update counts
        if (postId) {
          await this.updatePostVoteCounts(postId, existingVote.type, -1);
        } else if (commentId) {
          await this.updateCommentVoteCounts(commentId, existingVote.type, -1);
        }

        return {
          vote: null,
          action: 'removed',
          upvoteCount: existingVote.type === VoteType.UPVOTE ? -1 : 0,
          downvoteCount: existingVote.type === VoteType.DOWNVOTE ? -1 : 0,
        };
      } else {
        // Update the vote type
        vote = await this.prisma.vote.update({
          where: { id: existingVote.id },
          data: { type },
        });

        // Update counts: remove old vote, add new vote
        if (postId) {
          await this.updatePostVoteCounts(postId, existingVote.type, -1);
          await this.updatePostVoteCounts(postId, type, 1);
        } else if (commentId) {
          await this.updateCommentVoteCounts(commentId, existingVote.type, -1);
          await this.updateCommentVoteCounts(commentId, type, 1);
        }

        voteCountChange = {
          upvoteCount:
            type === VoteType.UPVOTE
              ? 1
              : existingVote.type === VoteType.UPVOTE
                ? -1
                : 0,
          downvoteCount:
            type === VoteType.DOWNVOTE
              ? 1
              : existingVote.type === VoteType.DOWNVOTE
                ? -1
                : 0,
        };

        return {
          vote,
          action: 'updated',
          ...voteCountChange,
        };
      }
    } else {
      // Create new vote
      vote = await this.prisma.vote.create({
        data: {
          type,
          userId,
          ...(postId ? { postId } : { commentId }),
        },
      });

      // Update counts
      if (postId) {
        await this.updatePostVoteCounts(postId, type, 1);
      } else if (commentId) {
        await this.updateCommentVoteCounts(commentId, type, 1);
      }

      voteCountChange = {
        upvoteCount: type === VoteType.UPVOTE ? 1 : 0,
        downvoteCount: type === VoteType.DOWNVOTE ? 1 : 0,
      };

      return {
        vote,
        action: 'created',
        ...voteCountChange,
      };
    }
  }

  private async updatePostVoteCounts(
    postId: string,
    voteType: VoteType,
    increment: number,
  ): Promise<void> {
    if (voteType === VoteType.UPVOTE) {
      await this.prisma.post.update({
        where: { id: postId },
        data: {
          upvoteCount: { increment },
        },
      });
    } else {
      await this.prisma.post.update({
        where: { id: postId },
        data: {
          downvoteCount: { increment },
        },
      });
    }
  }

  private async updateCommentVoteCounts(
    commentId: string,
    voteType: VoteType,
    increment: number,
  ): Promise<void> {
    if (voteType === VoteType.UPVOTE) {
      await this.prisma.comment.update({
        where: { id: commentId },
        data: {
          upvoteCount: { increment },
        },
      });
    } else {
      await this.prisma.comment.update({
        where: { id: commentId },
        data: {
          downvoteCount: { increment },
        },
      });
    }
  }

  async getUserVote(
    userId: string,
    postId?: string,
    commentId?: string,
  ): Promise<any> {
    if (!postId && !commentId) {
      throw new BadRequestException(
        'Either postId or commentId must be provided',
      );
    }

    if (postId && commentId) {
      throw new BadRequestException(
        'Cannot query vote for both post and comment simultaneously',
      );
    }

    const vote = await this.prisma.vote.findFirst({
      where: {
        userId,
        ...(postId ? { postId } : { commentId }),
      },
    });

    return vote || null;
  }
}

