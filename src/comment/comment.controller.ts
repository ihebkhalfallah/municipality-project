import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
  UseGuards,
  Req,
  BadRequestException,
  Patch,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { FindAllCommentsDto } from './dto/filter-comment.dto';
import { AuthenticatedRequest } from 'src/types/user-payload.interface';
import { Comment } from './comment.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  async findAll(@Query() findAllCommentsDto: FindAllCommentsDto) {
    return this.commentService.findAll(findAllCommentsDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.commentService.findOne(id);
  }

  @Post()
  async createComment(
    @Req() req: AuthenticatedRequest,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    try {
      const userId = req.user.userId;
      return this.commentService.createComment(userId, createCommentDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Patch(':id')
  async updateComment(
    @Param('id') commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    try {
      return await this.commentService.updateComment(commentId, updateCommentDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  async deleteComment(@Param('id') id: number): Promise<void> {
    try {
      await this.commentService.deleteComment(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
