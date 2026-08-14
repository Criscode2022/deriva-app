import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, AuthedRequest } from '../auth/auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get(':id')
  @UseGuards(AuthGuard)
  getUser(
    @Param('id', ParseIntPipe) userId: number,
    @Req() req: AuthedRequest,
  ) {
    if (req.auth.userId !== userId) {
      throw new ForbiddenException('Forbidden');
    }
    return this.users.getUser(userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async deleteUser(
    @Param('id', ParseIntPipe) userId: number,
    @Req() req: AuthedRequest,
  ) {
    if (req.auth.userId !== userId) {
      throw new ForbiddenException('Forbidden');
    }
    await this.users.deleteUser(userId);
    return { ok: true };
  }
}
