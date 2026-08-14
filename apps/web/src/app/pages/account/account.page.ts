import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-account-page',
  imports: [DatePipe],
  templateUrl: './account.page.html',
})
export class AccountPage {
  protected readonly auth = inject(AuthService);
  protected readonly error = signal('');
  protected readonly pending = signal(false);

  protected async removeAccount(): Promise<void> {
    if (!confirm('Delete this account? This cannot be undone.')) {
      return;
    }

    this.error.set('');
    this.pending.set(true);
    try {
      await this.auth.deleteAccount();
    } catch {
      this.error.set('Could not delete the account.');
      this.pending.set(false);
    }
  }
}
