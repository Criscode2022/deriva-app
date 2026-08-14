import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { ApiService } from '../../core/services/api.service';
import { Walk } from '../home/home.page';

@Component({
  selector: 'app-walk-page',
  imports: [RouterLink],
  templateUrl: './walk.page.html',
})
export class WalkPage {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  protected readonly walk = httpResource<Walk>(() => {
    const slug = this.route.snapshot.paramMap.get('slug');
    return slug ? this.api.url(`/walks/${slug}`) : undefined;
  });
}
