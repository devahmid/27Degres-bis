import { Controller, Post, Body, Get, Patch, Delete, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Public()
  @Post()
  create(@Body() createContactMessageDto: CreateContactMessageDto) {
    return this.contactService.create(createContactMessageDto);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  findAll() {
    return this.contactService.findAll();
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.findOne(id);
  }

  @Patch('admin/:id/read')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.markAsRead(id);
  }

  @Post('admin/:id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  reply(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { message: string; fromName?: string }
  ) {
    return this.contactService.reply(id, body.message, body.fromName);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.remove(id);
  }
}









