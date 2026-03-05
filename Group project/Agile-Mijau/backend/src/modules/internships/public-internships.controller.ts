import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { InternshipsService } from './internships.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('api/public/internships')
@Public()
export class PublicInternshipsController {
  constructor(private readonly internshipsService: InternshipsService) {}

  @Get()
  findPublicInternships(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.internshipsService.findPublicInternships(page, limit);
  }

  @Get(':id')
  findOnePublic(@Param('id', ParseUUIDPipe) id: string) {
    return this.internshipsService.findOnePublic(id);
  }
}
