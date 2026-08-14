import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthSession, User } from '../models/user';
import { ApiService } from './api.service';

const TOKEN_KEY = 'ann.accessToken';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  private readonly tokenState = signal<string | null>(this.readStoredToken());
  private readonly userState = signal<User | null>(null);

  readonly token = this.tokenState.asReadonly();
  readonly user = this.userState.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this.tokenState()));

  constructor() {
    if (this.tokenState()) {
      void this.refreshMe();
    }
  }

  async register(email: string, password: string): Promise<void> {
    const session = await firstValueFrom(
      this.api.post<AuthSession>('/auth/register', { email, password }),
    );
    this.applySession(session);
  }

  async login(email: string, password: string): Promise<void> {
    const session = await firstValueFrom(
      this.api.post<AuthSession>('/auth/login', { email, password }),
    );
    this.applySession(session);
  }

  async logout(): Promise<void> {
    try {
      if (this.tokenState()) {
        await firstValueFrom(this.api.post('/auth/logout', {}));
      }
    } catch {
      // Clear local session even if the API call fails.
    } finally {
      this.clearSession();
      void this.router.navigateByUrl('/');
    }
  }

  async deleteAccount(): Promise<void> {
    const user = this.userState();
    if (!user) {
      return;
    }
    await firstValueFrom(this.api.delete(`/users/${user.id}`));
    this.clearSession();
    void this.router.navigateByUrl('/');
  }

  private async refreshMe(): Promise<void> {
    try {
      const user = await firstValueFrom(this.api.get<User>('/auth/me'));
      this.userState.set(user);
    } catch {
      this.clearSession();
    }
  }

  private applySession(session: AuthSession): void {
    this.tokenState.set(session.token);
    this.userState.set({
      id: session.id,
      email: session.email,
      created_at: session.expires_at,
    });
    localStorage.setItem(TOKEN_KEY, session.token);
    void this.refreshMe();
  }

  private clearSession(): void {
    this.tokenState.set(null);
    this.userState.set(null);
    localStorage.removeItem(TOKEN_KEY);
  }

  private readStoredToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }
}
