import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { EventRegistration } from './entities/event-registration.entity';
import { EventImage } from './entities/event-image.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { SupabaseService } from '../storage/supabase.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(EventRegistration)
    private registrationsRepository: Repository<EventRegistration>,
    @InjectRepository(EventImage)
    private eventImagesRepository: Repository<EventImage>,
    private supabaseService: SupabaseService,
  ) {}

  async create(createEventDto: CreateEventDto, featuredImageFile?: Express.Multer.File): Promise<Event> {
    // Upload de l'image principale si fournie
    if (featuredImageFile) {
      const fileName = `event-${Date.now()}-${featuredImageFile.originalname}`;
      const { url } = await this.supabaseService.uploadFile(
        featuredImageFile.buffer,
        fileName,
        'events',
      );
      createEventDto.featuredImage = url;
    }

    const event = this.eventsRepository.create(createEventDto);
    return this.eventsRepository.save(event);
  }

  async uploadEventImage(eventId: number, file: Express.Multer.File, caption?: string, uploadedBy?: number): Promise<EventImage> {
    const fileName = `event-${eventId}-${Date.now()}-${file.originalname}`;
    const { url } = await this.supabaseService.uploadFile(
      file.buffer,
      fileName,
      'events/gallery',
    );

    const eventImage = this.eventImagesRepository.create({
      eventId,
      imageUrl: url,
      caption,
      uploadedBy,
    });

    return this.eventImagesRepository.save(eventImage);
  }

  async findAll(includeDrafts: boolean = false): Promise<Event[]> {
    const where: any = {};
    if (!includeDrafts) {
      where.status = 'published';
    }
    return this.eventsRepository.find({
      where,
      relations: ['creator', 'registrations'],
      order: { startDate: 'ASC' },
    });
  }

  async findAllAdmin(): Promise<Event[]> {
    return this.eventsRepository.find({
      relations: ['creator', 'registrations', 'images'],
      order: { startDate: 'DESC' },
    });
  }

  async findUpcoming(limit?: number): Promise<Event[]> {
    const query = this.eventsRepository
      .createQueryBuilder('event')
      .where('event.status = :status', { status: 'published' })
      .andWhere('event.startDate >= :now', { now: new Date() })
      .orderBy('event.startDate', 'ASC');

    if (limit) {
      query.limit(limit);
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['registrations', 'images'],
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto, featuredImageFile?: Express.Multer.File): Promise<Event> {
    // Upload de la nouvelle image principale si fournie
    if (featuredImageFile) {
      const fileName = `event-${id}-${Date.now()}-${featuredImageFile.originalname}`;
      const { url } = await this.supabaseService.uploadFile(
        featuredImageFile.buffer,
        fileName,
        'events',
      );
      updateEventDto.featuredImage = url;
    }

    await this.eventsRepository.update(id, updateEventDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.eventsRepository.delete(id);
  }

  async register(eventId: number, userId: number): Promise<EventRegistration> {
    // Vérifier si l'utilisateur est déjà inscrit à cet événement
    const existingRegistration = await this.registrationsRepository.findOne({
      where: { eventId, userId },
    });

    if (existingRegistration) {
      throw new ConflictException('Vous êtes déjà inscrit à cet événement.');
    }

    // Vérifier que l'événement existe
    const event = await this.eventsRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${eventId} introuvable`);
    }

    // Vérifier le statut de l'événement
    if (event.status === 'cancelled') {
      throw new BadRequestException('Cet événement a été annulé.');
    }

    if (event.status === 'draft') {
      throw new BadRequestException('Cet événement n\'est pas encore publié.');
    }

    // Vérifier que l'événement est publié (seul statut permettant l'inscription)
    if (event.status !== 'published') {
      // Cette vérification est nécessaire pour TypeScript, même si théoriquement
      // on a déjà couvert tous les cas avec les vérifications précédentes
      throw new BadRequestException('Cet événement n\'est pas disponible pour les inscriptions.');
    }

    // Vérifier si l'événement n'est pas complet (si maxParticipants est défini)
    if (event.maxParticipants) {
      const currentRegistrations = await this.registrationsRepository.count({
        where: { eventId },
      });
      if (currentRegistrations >= event.maxParticipants) {
        throw new BadRequestException('Cet événement est complet.');
      }
    }

    const registration = this.registrationsRepository.create({
      eventId,
      userId,
    });
    return this.registrationsRepository.save(registration);
  }

  async unregister(eventId: number, userId: number): Promise<void> {
    const registration = await this.registrationsRepository.findOne({
      where: { eventId, userId },
    });

    if (!registration) {
      throw new NotFoundException('Vous n\'êtes pas inscrit à cet événement.');
    }

    await this.registrationsRepository.remove(registration);
  }

  async isRegistered(eventId: number, userId: number): Promise<boolean> {
    const registration = await this.registrationsRepository.findOne({
      where: { eventId, userId },
    });
    return !!registration;
  }

  async getImages(eventId: number) {
    return this.eventImagesRepository.find({
      where: { eventId },
      relations: ['event'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllImages() {
    return this.eventImagesRepository.find({
      relations: ['event'],
      order: { createdAt: 'DESC' },
    });
  }

  async removeImage(imageId: number): Promise<void> {
    const image = await this.eventImagesRepository.findOne({ where: { id: imageId } });
    if (!image) {
      throw new NotFoundException(`Image avec l'ID ${imageId} introuvable`);
    }

    // Extraire le chemin du fichier depuis l'URL
    const urlParts = image.imageUrl.split('/');
    const filePath = urlParts.slice(-2).join('/'); // events/gallery/filename

    // Supprimer le fichier de Supabase Storage
    try {
      await this.supabaseService.deleteFile(filePath);
    } catch (error) {
      console.error(`Erreur lors de la suppression du fichier ${filePath}:`, error);
      // Continuer même si la suppression du fichier échoue
    }

    // Supprimer l'entrée de la base de données
    await this.eventImagesRepository.remove(image);
  }

  async getEventRegistrations(eventId: number) {
    const event = await this.eventsRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${eventId} introuvable`);
    }

    const registrations = await this.registrationsRepository.find({
      where: { eventId },
      relations: ['user'],
      order: { registeredAt: 'DESC' },
    });

    return registrations.map(reg => ({
      id: reg.id,
      userId: reg.userId,
      user: {
        id: reg.user.id,
        firstName: reg.user.firstName,
        lastName: reg.user.lastName,
        email: reg.user.email,
      },
      registeredAt: reg.registeredAt,
    }));
  }
}

