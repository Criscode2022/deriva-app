import { Controller, Get, Param } from '@nestjs/common';
import { WalksService } from './walks.service';

@Controller('walks')
export class WalksController {
  constructor(private readonly walks: WalksService) {}

  @Get()
  list() {
    return this.walks.list();
  }

  @Get(':slug')
  bySlug(@Param('slug') slug: string) {
    return this.walks.bySlug(slug);
  }
}
