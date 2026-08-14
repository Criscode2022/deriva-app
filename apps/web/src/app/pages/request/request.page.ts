import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-request-page',
  templateUrl: './request.page.html',
})
export class RequestPage {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly partySize = signal(2);

  protected setPartySize(value: string): void {
    this.partySize.set(Number(value));
  }
  protected readonly error = signal('');
  protected readonly pending = signal(false);
  protected readonly slug = this.route.snapshot.paramMap.get('slug') ?? '';

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    this.pending.set(true);
    this.error.set('');
    try {
      const created = await firstValueFrom(
        this.api.post<{ code: string }>('/requests', {
          walkSlug: this.slug,
          name: this.name(),
          email: this.email(),
          partySize: this.partySize(),
        }),
      );
      await this.router.navigate(['/ok', created.code]);
    } catch {
      this.error.set('No se pudo enviar. Revisa el email y reintenta.');
    } finally {
      this.pending.set(false);
    }
  }
}
