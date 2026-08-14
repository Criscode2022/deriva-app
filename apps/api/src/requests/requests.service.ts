import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { WalksService } from '../walks/walks.service';
import { CreateRequestDto } from './dto/create-request.dto';

const STATUSES = ['NEW', 'CONTACTED', 'CONFIRMED', 'WAITLIST', 'CANCELLED'] as const;

@Injectable()
export class RequestsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly walks: WalksService,
  ) {}

  private code(): string {
    const d = new Date();
    const stamp = `${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const n = String(Math.floor(Math.random() * 900) + 100);
    return `DV-${stamp}-${n}`;
  }

  async create(dto: CreateRequestDto) {
    const walk = await this.walks.bySlug(dto.walkSlug);
    const confirmed = await this.db.getSql()`
      SELECT COUNT(*)::int AS n FROM public.walk_requests
      WHERE walk_id = ${walk.id} AND status = 'CONFIRMED'
    `;
    const taken = Number((confirmed[0] as { n: number }).n);
    const status = taken >= walk.seats ? 'WAITLIST' : 'NEW';
    const code = this.code();
    const rows = await this.db.getSql()`
      INSERT INTO public.walk_requests (code, walk_id, name, email, party_size, preferred_date, note, status)
      VALUES (${code}, ${walk.id}, ${dto.name}, ${dto.email}, ${dto.partySize}, ${dto.preferredDate ?? null}, ${dto.note ?? ''}, ${status})
      RETURNING *
    `;
    return { ...(rows[0] as object), walkTitle: walk.title, walkSeats: walk.seats };
  }

  async list() {
    const rows = await this.db.getSql()`
      SELECT r.*, w.title AS walk_title, w.seats AS walk_seats
      FROM public.walk_requests r
      JOIN public.walks w ON w.id = r.walk_id
      ORDER BY r.created_at DESC
    `;
    return rows;
  }

  async updateStatus(id: number, status: string) {
    if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
      throw new NotFoundException('Unknown status');
    }
    const rows = await this.db.getSql()`
      UPDATE public.walk_requests SET status = ${status} WHERE id = ${id} RETURNING *
    `;
    if (!rows[0]) {
      throw new NotFoundException('Request not found');
    }
    return rows[0];
  }
}
