import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { ApiService } from '../../core/services/api.service';

export interface Walk {
  id: number;
  slug: string;
  title: string;
  barrio: string;
  duration_min: number;
  seats: number;
  image: string;
  meeting: string;
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home.page.html',
})
export class HomePage {
  private readonly api = inject(ApiService);
  protected readonly walks = httpResource<Walk[]>(() => this.api.url('/walks'));
}
