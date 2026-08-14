import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(private readonly auth: AuthService) {}

  getUser(userId: number) {
    return this.auth.getUser(userId);
  }

  deleteUser(userId: number) {
    return this.auth.deleteUser(userId);
  }
}
