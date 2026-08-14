import { Component, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

interface WalkRequest {
  id: number;
  code: string;
  name: string;
  status: string;
  party_size: number;
  walk_title: string;
}

@Component({
  selector: 'app-inbox-page',
  templateUrl: './inbox.page.html',
})
export class InboxPage {
  private readonly api = inject(ApiService);
  protected readonly requests = httpResource<WalkRequest[]>(() =>
    this.api.url('/requests'),
  );

  protected async setStatus(id: number, status: string): Promise<void> {
    await firstValueFrom(this.api.patch(`/requests/${id}`, { status }));
    this.requests.reload();
  }
}
