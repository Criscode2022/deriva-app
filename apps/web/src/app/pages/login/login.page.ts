import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login.page.html',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly mode = signal<'login' | 'register'>('login');
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly error = signal('');
  protected readonly pending = signal(false);

  protected toggleMode(): void {
    this.mode.update((mode) => (mode === 'login' ? 'register' : 'login'));
    this.error.set('');
  }

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    this.error.set('');
    this.pending.set(true);

    try {
      if (this.mode() === 'register') {
        await this.auth.register(this.email(), this.password());
      } else {
        await this.auth.login(this.email(), this.password());
      }
      await this.router.navigateByUrl('/inbox');
    } catch (err) {
      this.error.set(this.readError(err));
    } finally {
      this.pending.set(false);
    }
  }

  private readError(err: unknown): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const body = (err as { error?: { error?: string } }).error;
      if (body?.error) {
        return body.error;
      }
    }
    return 'Request failed. Check the API and try again.';
  }
}
