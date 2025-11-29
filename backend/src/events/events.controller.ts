import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  @UseInterceptors(FileInterceptor('featuredImage'))
  create(
    @Body() createEventDto: CreateEventDto,
    @Request() req,
    @UploadedFile() featuredImage?: Express.Multer.File,
  ) {
    return this.eventsService.create(
      {
        ...createEventDto,
        createdBy: req.user.id,
      },
      featuredImage,
    );
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  findAllAdmin() {
    return this.eventsService.findAllAdmin();
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get('upcoming')
  findUpcoming(@Query('limit') limit?: number) {
    return this.eventsService.findUpcoming(limit ? +limit : undefined);
  }

  @Get('images')
  getAllImages() {
    return this.eventsService.getAllImages();
  }

  @Delete('images/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  removeImage(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.removeImage(id);
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  register(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.eventsService.register(id, req.user.id);
  }

  @Delete(':id/register')
  @UseGuards(JwtAuthGuard)
  unregister(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.eventsService.unregister(id, req.user.id);
  }

  @Get(':id/registered')
  @UseGuards(JwtAuthGuard)
  async isRegistered(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const registered = await this.eventsService.isRegistered(id, req.user.id);
    return { registered };
  }

  @Get(':id/images')
  getImages(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.getImages(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOne(id);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('caption') caption?: string,
    @Request() req?: any,
  ) {
    return this.eventsService.uploadEventImage(id, file, caption, req?.user?.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  @UseInterceptors(FileInterceptor('featuredImage'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventDto,
    @UploadedFile() featuredImage?: Express.Multer.File,
  ) {
    return this.eventsService.update(+id, updateEventDto, featuredImage);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'bureau')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.remove(id);
  }
}

