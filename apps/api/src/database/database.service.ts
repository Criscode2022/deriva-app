import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { neon, NeonQueryFunction } from '@neondatabase/serverless';

@Injectable()
export class DatabaseService {
  private sql: NeonQueryFunction<false, false> | null = null;

  constructor(private readonly config: ConfigService) {}

  getSql(): NeonQueryFunction<false, false> {
    if (!this.sql) {
      const databaseUrl = this.config.get<string>('DATABASE_URL');
      if (!databaseUrl) {
        throw Object.assign(new Error('DATABASE_URL is not set'), {
          status: 500,
        });
      }
      this.sql = neon(databaseUrl);
    }
    return this.sql;
  }

  async ensureSchema(): Promise<void> {
    const sql = this.getSql();
    await sql`
      CREATE TABLE IF NOT EXISTS public.users (
        id BIGSERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS public.sessions (
        id UUID PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        expires_at TIMESTAMPTZ NOT NULL,
        revoked_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      )
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions (user_id)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON public.sessions (expires_at)
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS public.walks (
        id BIGSERIAL PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        barrio TEXT NOT NULL,
        duration_min INT NOT NULL,
        distance_m INT NOT NULL,
        meeting TEXT NOT NULL,
        lat DOUBLE PRECISION NOT NULL,
        lng DOUBLE PRECISION NOT NULL,
        seats INT NOT NULL,
        image TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS public.walk_requests (
        id BIGSERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        walk_id BIGINT NOT NULL REFERENCES public.walks(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        party_size INT NOT NULL,
        preferred_date TEXT,
        note TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'NEW',
        created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      )
    `;
    const existing = await sql`SELECT id FROM public.walks LIMIT 1`;
    if (!existing[0]) {
      await sql`
        INSERT INTO public.walks (slug, title, barrio, duration_min, distance_m, meeting, lat, lng, seats, image, description)
        VALUES
        ('patios-embajadores', 'Patios de Embajadores', 'Embajadores', 70, 1400, 'Fuente, Embajadores 18', 40.4089, -3.7038, 8, '/assets/walks/patio.jpg', 'Patios y callejones del barrio. Pausa cada 15 minutos.'),
        ('mercado-cebada', 'Mercado de la Cebada', 'La Latina', 55, 900, 'Puerta principal del mercado', 40.4112, -3.7081, 10, '/assets/walks/mercado.jpg', 'Puestos, azulejos y la plaza anexa.'),
        ('ribera-manzanares', 'Ribera del Manzanares', 'Arganzuela', 80, 2100, 'Pasarela de la Arganzuela', 40.3955, -3.6984, 12, '/assets/walks/ribera.jpg', 'Paseo de ribera al anochecer.'),
        ('plaza-angel', 'Plaza del Ángel', 'Huertas', 45, 700, 'Banco bajo la farola', 40.4146, -3.7011, 6, '/assets/walks/plaza.jpg', 'Plaza chica y fachadas de ladrillo.')
      `;
    }
  }
}
