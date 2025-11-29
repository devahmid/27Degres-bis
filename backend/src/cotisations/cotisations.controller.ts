import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { CotisationsService } from './cotisations.service';
import { CreateCotisationDto } from './dto/create-cotisation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('cotisations')
export class CotisationsController {
  constructor(private readonly cotisationsService: CotisationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('current')
  getCurrent(@Request() req) {
    return this.cotisationsService.findCurrentYear(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  getHistory(@Request() req) {
    return this.cotisationsService.findHistory(req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createCotisationDto: CreateCotisationDto) {
    return this.cotisationsService.create(createCotisationDto);
  }

  // Admin endpoints
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll(@Query('year') year?: number) {
    if (year) {
      return this.cotisationsService.findByYear(+year);
    }
    return this.cotisationsService.findAll();
  }

  @Get('admin/statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getStatistics() {
    return this.cotisationsService.getStatistics();
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.cotisationsService.findOne(+id);
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.cotisationsService.update(+id, updateData);
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'paid' | 'pending' | 'overdue'; transactionId?: string }
  ) {
    return this.cotisationsService.updateStatus(+id, body.status, body.transactionId);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.cotisationsService.remove(+id);
  }

  @Post('webhook/sumup')
  async handleSumUpWebhook(@Body() payload: any) {
    // TODO: Implement SumUp webhook handling
    return { message: 'Webhook received' };
  }
}

