import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { SupabaseService } from '../storage/supabase.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
    private supabaseService: SupabaseService,
  ) {}

  async findAll(userId?: number): Promise<Document[]> {
    const queryBuilder = this.documentsRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.uploader', 'uploader')
      .leftJoinAndSelect('document.assignedToUser', 'assignedToUser')
      .orderBy('document.createdAt', 'DESC');

    if (userId) {
      queryBuilder.where('document.assignedToUserId = :userId', { userId });
    }

    return queryBuilder.getMany();
  }

  /**
   * Récupère les documents accessibles à un utilisateur :
   * - Documents généraux (sans assignedToUserId)
   * - Documents assignés à cet utilisateur
   */
  async findAllForUser(userId: number): Promise<Document[]> {
    const documents = await this.documentsRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.uploader', 'uploader')
      .leftJoinAndSelect('document.assignedToUser', 'assignedToUser')
      .where('document.assignedToUserId IS NULL OR document.assignedToUserId = :userId', { userId })
      .orderBy('document.createdAt', 'DESC')
      .getMany();

    // Générer les URLs appropriées pour chaque document
    return Promise.all(
      documents.map(async (doc) => {
        if (doc.assignedToUserId && doc.filePath) {
          // Document personnel : générer une URL signée
          try {
            const signedUrl = await this.supabaseService.getSignedUrl(doc.filePath, 3600);
            return { ...doc, fileUrl: signedUrl };
          } catch (error) {
            console.error(`Erreur lors de la génération de l'URL signée pour le document ${doc.id}:`, error);
            return doc;
          }
        }
        // Document général : utiliser l'URL publique déjà stockée
        return doc;
      })
    );
  }

  async findByUserId(userId: number): Promise<Document[]> {
    const documents = await this.documentsRepository.find({
      where: { assignedToUserId: userId },
      order: { createdAt: 'DESC' },
      relations: ['uploader', 'assignedToUser'],
    });

    // Générer des URLs signées pour tous les documents personnels
    return Promise.all(
      documents.map(async (doc) => {
        if (doc.filePath) {
          try {
            const signedUrl = await this.supabaseService.getSignedUrl(doc.filePath, 3600);
            return { ...doc, fileUrl: signedUrl };
          } catch (error) {
            console.error(`Erreur lors de la génération de l'URL signée pour le document ${doc.id}:`, error);
            return doc;
          }
        }
        return doc;
      })
    );
  }

  async findOne(id: number): Promise<Document> {
    const document = await this.documentsRepository.findOne({
      where: { id },
      relations: ['uploader', 'assignedToUser'],
    });

    if (!document) {
      throw new NotFoundException(`Document avec l'ID ${id} introuvable`);
    }

    // Si c'est un document personnel avec filePath, générer une URL signée
    if (document.assignedToUserId && document.filePath) {
      try {
        const signedUrl = await this.supabaseService.getSignedUrl(document.filePath, 3600);
        return { ...document, fileUrl: signedUrl };
      } catch (error) {
        console.error(`Erreur lors de la génération de l'URL signée pour le document ${id}:`, error);
      }
    }

    return document;
  }

  async create(
    createDocumentDto: CreateDocumentDto,
    file: Express.Multer.File,
    userId: number,
  ): Promise<Document> {
    // Upload du fichier vers Supabase Storage
    const folder = createDocumentDto.category || 'general';
    const fileName = `${Date.now()}-${file.originalname}`;
    
    const { url, path } = await this.supabaseService.uploadFile(
      file.buffer,
      fileName,
      folder,
    );

    // Si le document est assigné à un utilisateur (document personnel), on stocke le path
    // Sinon, on stocke l'URL publique (document général)
    const isPersonalDocument = !!createDocumentDto.assignedToUserId;

    // Créer l'entrée dans la base de données
    const document = this.documentsRepository.create({
      ...createDocumentDto,
      fileUrl: isPersonalDocument ? '' : url, // URL vide pour les documents personnels
      filePath: isPersonalDocument ? path : undefined, // Path pour générer des URLs signées
      fileType: file.mimetype,
      fileSize: file.size,
      uploadedBy: userId,
      assignedToUserId: createDocumentDto.assignedToUserId || undefined,
    });

    return this.documentsRepository.save(document);
  }

  async remove(id: number): Promise<void> {
    const document = await this.documentsRepository.findOne({
      where: { id },
      relations: ['uploader', 'assignedToUser'],
    });

    if (!document) {
      throw new NotFoundException(`Document avec l'ID ${id} introuvable`);
    }

    // Utiliser filePath si disponible (document personnel), sinon extraire de fileUrl
    let filePath: string;
    if (document.filePath) {
      filePath = document.filePath;
    } else if (document.fileUrl) {
      // Extraire le chemin du fichier depuis l'URL publique
      const urlParts = document.fileUrl.split('/');
      filePath = urlParts.slice(-2).join('/'); // Prendre les 2 derniers segments (folder/filename)
    } else {
      throw new Error(`Impossible de déterminer le chemin du fichier pour le document ${id}`);
    }

    // Supprimer le fichier de Supabase Storage
    try {
      await this.supabaseService.deleteFile(filePath);
    } catch (error) {
      console.error(`Erreur lors de la suppression du fichier ${filePath}:`, error);
      // Continuer même si la suppression du fichier échoue
    }

    // Supprimer l'entrée de la base de données
    await this.documentsRepository.remove(document);
  }

  async getDownloadUrl(id: number, expiresIn: number = 3600): Promise<string> {
    const document = await this.documentsRepository.findOne({
      where: { id },
      relations: ['uploader', 'assignedToUser'],
    });

    if (!document) {
      throw new NotFoundException(`Document avec l'ID ${id} introuvable`);
    }

    // Utiliser filePath si disponible (document personnel), sinon extraire de fileUrl
    let filePath: string;
    if (document.filePath) {
      filePath = document.filePath;
    } else {
      // Extraire le chemin du fichier depuis l'URL publique
      const urlParts = document.fileUrl.split('/');
      filePath = urlParts.slice(-2).join('/');
    }

    // Générer une URL signée pour le téléchargement
    return this.supabaseService.getSignedUrl(filePath, expiresIn);
  }
}
