import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface Walk {
  id: number;
  slug: string;
  title: string;
  barrio: string;
  duration_min: number;
  distance_m: number;
  meeting: string;
  lat: number;
  lng: number;
  seats: number;
  image: string;
  description: string;
}

@Injectable()
export class WalksService {
  constructor(private readonly db: DatabaseService) {}

  private map(row: Record<string, unknown>): Walk {
    return {
      id: Number(row.id),
      slug: String(row.slug),
      title: String(row.title),
      barrio: String(row.barrio),
      duration_min: Number(row.duration_min),
      distance_m: Number(row.distance_m),
      meeting: String(row.meeting),
      lat: Number(row.lat),
      lng: Number(row.lng),
      seats: Number(row.seats),
      image: String(row.image),
      description: String(row.description),
    };
  }

  async list(): Promise<Walk[]> {
    const rows = await this.db.getSql()`SELECT * FROM public.walks ORDER BY title`;
    return rows.map((row) => this.map(row as Record<string, unknown>));
  }

  async bySlug(slug: string): Promise<Walk> {
    const rows = await this.db.getSql()`
      SELECT * FROM public.walks WHERE slug = ${slug} LIMIT 1
    `;
    if (!rows[0]) {
      throw new NotFoundException('Walk not found');
    }
    return this.map(rows[0] as Record<string, unknown>);
  }

  async byId(id: number): Promise<Walk> {
    const rows = await this.db.getSql()`
      SELECT * FROM public.walks WHERE id = ${id} LIMIT 1
    `;
    if (!rows[0]) {
      throw new NotFoundException('Walk not found');
    }
    return this.map(rows[0] as Record<string, unknown>);
  }
}
