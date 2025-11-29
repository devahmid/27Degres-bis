import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GalleryImage } from './entities/gallery-image.entity';
import { CreateGalleryImageDto } from './dto/create-gallery-image.dto';
import { UpdateGalleryImageDto } from './dto/update-gallery-image.dto';
import { SupabaseService } from '../storage/supabase.service';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(GalleryImage)
    private galleryRepository: Repository<GalleryImage>,
    private supabaseService: SupabaseService,
  ) {}

  async create(
    createGalleryImageDto: CreateGalleryImageDto,
    file: Express.Multer.File,
    userId: number,
  ): Promise<GalleryImage> {
    // Convertir la valeur en boolean (gérer les strings "true"/"false" du FormData)
    let isPublic = true; // Par défaut public
    if (createGalleryImageDto.isPublic !== undefined) {
      if (typeof createGalleryImageDto.isPublic === 'string') {
        isPublic = createGalleryImageDto.isPublic === 'true';
      } else {
        isPublic = createGalleryImageDto.isPublic === true;
      }
    }

    const fileName = `gallery-${Date.now()}-${file.originalname}`;
    const folder = isPublic ? 'gallery/public' : 'gallery/private';

    const { url, path } = await this.supabaseService.uploadFile(
      file.buffer,
      fileName,
      folder,
    );

    const image = this.galleryRepository.create({
      ...createGalleryImageDto,
      imageUrl: isPublic ? url : '', // URL vide pour les images privées
      filePath: isPublic ? undefined : path, // Path pour générer des URLs signées
      isPublic,
      uploadedBy: userId,
    });

    return this.galleryRepository.save(image);
  }

  async findAll(userId?: number): Promise<GalleryImage[]> {
    const queryBuilder = this.galleryRepository
      .createQueryBuilder('image')
      .leftJoinAndSelect('image.uploader', 'uploader')
      .orderBy('image.createdAt', 'DESC');

    if (userId) {
      // Retourner les images publiques + les images privées de l'utilisateur
      queryBuilder.where(
        '(image.isPublic = true OR (image.isPublic = false AND image.uploadedBy = :userId))',
        { userId },
      );
    } else {
      // Sans utilisateur, seulement les images publiques
      queryBuilder.where('image.isPublic = true');
    }

    const images = await queryBuilder.getMany();

    // Générer des URLs signées pour les images privées
    return Promise.all(
      images.map(async (image) => {
        if (!image.isPublic && image.filePath) {
          try {
            const signedUrl = await this.supabaseService.getSignedUrl(image.filePath, 3600);
            return { ...image, imageUrl: signedUrl };
          } catch (error) {
            console.error(`Erreur lors de la génération de l'URL signée pour l'image ${image.id}:`, error);
            return image;
          }
        }
        return image;
      }),
    );
  }

  async findAllAdmin(): Promise<GalleryImage[]> {
    return this.galleryRepository.find({
      relations: ['uploader'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId?: number): Promise<GalleryImage> {
    const image = await this.galleryRepository.findOne({
      where: { id },
      relations: ['uploader'],
    });

    if (!image) {
      throw new NotFoundException(`Image avec l'ID ${id} introuvable`);
    }

    // Vérifier les permissions
    if (!image.isPublic && image.uploadedBy !== userId) {
      throw new NotFoundException(`Image avec l'ID ${id} introuvable`);
    }

    // Générer une URL signée si c'est une image privée
    if (!image.isPublic && image.filePath) {
      try {
        const signedUrl = await this.supabaseService.getSignedUrl(image.filePath, 3600);
        return { ...image, imageUrl: signedUrl };
      } catch (error) {
        console.error(`Erreur lors de la génération de l'URL signée:`, error);
      }
    }

    return image;
  }

  async update(id: number, updateGalleryImageDto: UpdateGalleryImageDto, userId?: number, userRole?: string): Promise<GalleryImage> {
    const image = await this.galleryRepository.findOne({ where: { id } });
    if (!image) {
      throw new NotFoundException(`Image avec l'ID ${id} introuvable`);
    }

    // Vérifier les permissions : seul le propriétaire ou un admin/bureau peut modifier
    if (userId && image.uploadedBy !== userId && userRole !== 'admin' && userRole !== 'bureau') {
      throw new NotFoundException(`Image avec l'ID ${id} introuvable`);
    }

    // Convertir isPublic en boolean si c'est une string (venant de FormData ou JSON)
    let newIsPublic: boolean | undefined = undefined;
    if (updateGalleryImageDto.isPublic !== undefined) {
      if (typeof updateGalleryImageDto.isPublic === 'string') {
        newIsPublic = updateGalleryImageDto.isPublic === 'true' || updateGalleryImageDto.isPublic === '1';
      } else if (typeof updateGalleryImageDto.isPublic === 'boolean') {
        newIsPublic = updateGalleryImageDto.isPublic;
      } else {
        // Gérer les cas où c'est un nombre (0/1)
        newIsPublic = Boolean(updateGalleryImageDto.isPublic);
      }
    }

    // Si isPublic change, déplacer le fichier dans Supabase Storage
    if (newIsPublic !== undefined && newIsPublic !== image.isPublic) {
      // Déterminer le chemin actuel du fichier
      let currentFilePath: string;
      if (image.filePath) {
        currentFilePath = image.filePath;
      } else if (image.imageUrl) {
        currentFilePath = this.supabaseService.extractFilePathFromPublicUrl(image.imageUrl) || '';
      } else {
        throw new Error(`Impossible de déterminer le chemin du fichier pour l'image ${id}`);
      }

      if (currentFilePath) {
        try {
          // Télécharger le fichier depuis l'ancien emplacement
          const fileBuffer = await this.supabaseService.downloadFile(currentFilePath);
          
          // Déterminer le nouveau chemin
          const fileName = currentFilePath.split('/').pop() || `gallery-${Date.now()}.jpg`;
          const newFolder = newIsPublic ? 'gallery/public' : 'gallery/private';
          
          // Uploader dans le nouveau dossier
          const { url, path } = await this.supabaseService.uploadFile(
            fileBuffer,
            fileName,
            newFolder,
          );
          
          // Supprimer l'ancien fichier
          try {
            await this.supabaseService.deleteFile(currentFilePath);
          } catch (error) {
            console.error(`Erreur lors de la suppression de l'ancien fichier ${currentFilePath}:`, error);
            // Continuer même si la suppression échoue
          }
          
          // Mettre à jour imageUrl et filePath
          image.imageUrl = newIsPublic ? url : '';
          image.filePath = newIsPublic ? undefined : path;
          image.isPublic = newIsPublic;
        } catch (error) {
          console.error(`Erreur lors du déplacement du fichier pour l'image ${id}:`, error);
          throw new Error(`Erreur lors du déplacement du fichier: ${error.message}`);
        }
      }
    } else if (newIsPublic !== undefined) {
      // Si isPublic ne change pas mais est défini, juste mettre à jour la valeur
      image.isPublic = newIsPublic;
    }

    // Mettre à jour les autres champs
    if (updateGalleryImageDto.caption !== undefined) {
      image.caption = updateGalleryImageDto.caption || null;
    }
    if (updateGalleryImageDto.category !== undefined) {
      image.category = updateGalleryImageDto.category || null;
    }

    return this.galleryRepository.save(image);
  }

  async remove(id: number, userId?: number, userRole?: string): Promise<void> {
    const image = await this.galleryRepository.findOne({ where: { id } });
    if (!image) {
      throw new NotFoundException(`Image avec l'ID ${id} introuvable`);
    }

    // Vérifier les permissions : seul le propriétaire ou un admin/bureau peut supprimer
    if (userId && image.uploadedBy !== userId && userRole !== 'admin' && userRole !== 'bureau') {
      throw new NotFoundException(`Image avec l'ID ${id} introuvable`);
    }

    // Utiliser filePath si disponible, sinon extraire de imageUrl
    let filePath: string;
    if (image.filePath) {
      filePath = image.filePath;
    } else if (image.imageUrl) {
      const urlParts = image.imageUrl.split('/');
      filePath = urlParts.slice(-2).join('/');
    } else {
      throw new Error(`Impossible de déterminer le chemin du fichier pour l'image ${id}`);
    }

    // Supprimer le fichier de Supabase Storage
    try {
      await this.supabaseService.deleteFile(filePath);
    } catch (error) {
      console.error(`Erreur lors de la suppression du fichier ${filePath}:`, error);
    }

    // Supprimer l'entrée de la base de données
    await this.galleryRepository.remove(image);
  }
}
