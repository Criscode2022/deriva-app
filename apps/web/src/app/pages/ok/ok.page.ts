import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-ok-page',
  imports: [RouterLink],
  template: `
    <section class="mx-auto max-w-2xl px-6 py-16">
      <p class="text-xs uppercase tracking-[0.16em] text-terracotta">Solicitud enviada</p>
      <h1 class="mt-4 font-serif text-5xl">Código {{ code }}</h1>
      <p class="mt-4">Aún no hay plaza. El guía confirmará o te pondrá en lista si el paseo está lleno.</p>
      <a routerLink="/" class="mt-8 inline-block bg-ink px-5 py-3 text-cream">Volver al plano</a>
    </section>
  `,
})
export class OkPage {
  protected readonly code = inject(ActivatedRoute).snapshot.paramMap.get('code');
}
