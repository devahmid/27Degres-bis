import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { EventRegistration } from './entities/event-registration.entity';
import { EventImage } from './entities/event-image.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { SupabaseService } from '../storage/supabase.service';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

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
    private mailService: MailService,
    private usersService: UsersService,
    private configService: ConfigService,
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
    const savedEvent = await this.eventsRepository.save(event);

    // Envoyer un email de notification à tous les membres actifs avec consentNewsletter si l'événement est publié
    if (savedEvent.status === 'published') {
      try {
        const members = await this.usersService.findActiveMembersWithNewsletter();
        const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:4200');
        const eventUrl = `${frontendUrl}/events/${savedEvent.id}`;

        // Envoyer les emails en parallèle (sans attendre)
        const emailPromises = members.map(member =>
          this.mailService.sendNewEventNotificationEmail(
            member.email,
            member.firstName,
            savedEvent.title,
            savedEvent.description || '',
            savedEvent.startDate,
            savedEvent.location,
            eventUrl
          ).catch(error => {
            console.error(`Erreur lors de l'envoi de l'email à ${member.email}:`, error);
          })
        );

        // Ne pas bloquer la réponse si l'envoi d'emails échoue
        Promise.all(emailPromises).catch(error => {
          console.error('Erreur lors de l\'envoi des emails de notification d\'événement:', error);
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des membres pour l\'envoi d\'emails:', error);
        // Ne pas faire échouer la création de l'événement si l'envoi d'emails échoue
      }
    }

    return savedEvent;
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
    // Récupérer l'événement actuel pour vérifier le changement de statut
    const currentEvent = await this.eventsRepository.findOne({ where: { id } });
    if (!currentEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

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
    const updatedEvent = await this.findOne(id);

    // Envoyer un email de notification si le statut passe de "draft" à "published"
    if (currentEvent.status !== 'published' && updatedEvent.status === 'published') {
      try {
        const members = await this.usersService.findActiveMembersWithNewsletter();
        const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:4200');
        const eventUrl = `${frontendUrl}/events/${updatedEvent.id}`;

        // Envoyer les emails en parallèle (sans attendre)
        const emailPromises = members.map(member =>
          this.mailService.sendNewEventNotificationEmail(
            member.email,
            member.firstName,
            updatedEvent.title,
            updatedEvent.description || '',
            updatedEvent.startDate,
            updatedEvent.location,
            eventUrl
          ).catch(error => {
            console.error(`Erreur lors de l'envoi de l'email à ${member.email}:`, error);
          })
        );

        // Ne pas bloquer la réponse si l'envoi d'emails échoue
        Promise.all(emailPromises).catch(error => {
          console.error('Erreur lors de l\'envoi des emails de notification d\'événement:', error);
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des membres pour l\'envoi d\'emails:', error);
        // Ne pas faire échouer la mise à jour si l'envoi d'emails échoue
      }
    }

    return updatedEvent;
  }

  async remove(id: number): Promise<void> {
    await this.eventsRepository.delete(id);
  }

  async register(eventId: number, userId: number, registerDto?: any): Promise<EventRegistration> {
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
      availabilityType: registerDto?.availabilityType || 'full',
      availabilityDetails: registerDto?.availabilityDetails,
      isVolunteer: registerDto?.isVolunteer || false,
      volunteerActivities: registerDto?.volunteerActivities ? JSON.stringify(registerDto.volunteerActivities) : null,
      notes: registerDto?.notes,
    });
    const savedRegistration = await this.registrationsRepository.save(registration);

    // Envoyer un email de confirmation d'inscription
    try {
      const user = await this.usersService.findOne(userId);
      const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:4200');
      const eventUrl = `${frontendUrl}/events/${eventId}`;

      let volunteerActivities: string[] = [];
      if (registerDto?.volunteerActivities && Array.isArray(registerDto.volunteerActivities)) {
        volunteerActivities = registerDto.volunteerActivities;
      }

      await this.mailService.sendEventRegistrationConfirmationEmail(
        user.email,
        user.firstName,
        event.title,
        event.startDate,
        event.location,
        registerDto?.availabilityType || 'full',
        registerDto?.availabilityDetails,
        registerDto?.isVolunteer || false,
        volunteerActivities,
        eventUrl
      );
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de confirmation d\'inscription:', error);
      // Ne pas faire échouer l'inscription si l'email échoue
    }

    return savedRegistration;
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
      availabilityType: reg.availabilityType,
      availabilityDetails: reg.availabilityDetails,
      isVolunteer: reg.isVolunteer,
      volunteerActivities: reg.volunteerActivities ? JSON.parse(reg.volunteerActivities) : [],
      notes: reg.notes,
      registeredAt: reg.registeredAt,
    }));
  }

  async getPublicEventRegistrations(eventId: number) {
    const event = await this.eventsRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${eventId} introuvable`);
    }

    const registrations = await this.registrationsRepository.find({
      where: { eventId },
      relations: ['user'],
      order: { registeredAt: 'DESC' },
    });

    // Retourner les inscriptions sans les emails pour la confidentialité
    return registrations.map(reg => ({
      id: reg.id,
      user: {
        id: reg.user.id,
        firstName: reg.user.firstName,
        lastName: reg.user.lastName,
        // Pas d'email pour la confidentialité
      },
      availabilityType: reg.availabilityType,
      availabilityDetails: reg.availabilityDetails,
      isVolunteer: reg.isVolunteer,
      volunteerActivities: reg.volunteerActivities ? JSON.parse(reg.volunteerActivities) : [],
      // Pas de notes pour la confidentialité
      registeredAt: reg.registeredAt,
    }));
  }

  async getUserRegistrations(userId: number) {
    const registrations = await this.registrationsRepository.find({
      where: { userId },
      relations: ['event'],
      order: { registeredAt: 'DESC' },
    });

    return registrations.map(reg => ({
      id: reg.id,
      eventId: reg.eventId,
      event: {
        id: reg.event.id,
        title: reg.event.title,
        description: reg.event.description,
        startDate: reg.event.startDate,
        endDate: reg.event.endDate,
        location: reg.event.location,
        status: reg.event.status,
        featuredImage: reg.event.featuredImage,
      },
      availabilityType: reg.availabilityType,
      availabilityDetails: reg.availabilityDetails,
      isVolunteer: reg.isVolunteer,
      volunteerActivities: reg.volunteerActivities ? JSON.parse(reg.volunteerActivities) : [],
      notes: reg.notes,
      registeredAt: reg.registeredAt,
    }));
  }

  async updateRegistration(registrationId: number, userId: number, updateDto: any): Promise<EventRegistration> {
    const registration = await this.registrationsRepository.findOne({
      where: { id: registrationId },
      relations: ['event'],
    });

    if (!registration) {
      throw new NotFoundException(`Inscription avec l'ID ${registrationId} introuvable`);
    }

    // Vérifier que l'utilisateur est bien propriétaire de cette inscription
    if (registration.userId !== userId) {
      throw new BadRequestException('Vous n\'êtes pas autorisé à modifier cette inscription.');
    }

    // Vérifier que l'événement n'est pas annulé
    if (registration.event.status === 'cancelled') {
      throw new BadRequestException('Cet événement a été annulé. Vous ne pouvez plus modifier votre inscription.');
    }

    // Mettre à jour les champs
    if (updateDto.availabilityType !== undefined) {
      registration.availabilityType = updateDto.availabilityType;
    }
    if (updateDto.availabilityDetails !== undefined) {
      registration.availabilityDetails = updateDto.availabilityDetails;
    }
    if (updateDto.isVolunteer !== undefined) {
      registration.isVolunteer = updateDto.isVolunteer;
    }
    if (updateDto.volunteerActivities !== undefined) {
      registration.volunteerActivities = Array.isArray(updateDto.volunteerActivities) 
        ? JSON.stringify(updateDto.volunteerActivities) 
        : null;
    }
    if (updateDto.notes !== undefined) {
      registration.notes = updateDto.notes;
    }

    return this.registrationsRepository.save(registration);
  }
}

