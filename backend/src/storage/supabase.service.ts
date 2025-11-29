import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase: SupabaseClient;
  private bucketName = 'documents'; // Nom du bucket dans Supabase Storage

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️  Supabase URL ou Service Role Key non configurés. Le stockage de fichiers ne fonctionnera pas.');
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /**
   * Nettoie et normalise un nom de fichier pour Supabase Storage
   * @param fileName Nom du fichier original
   * @returns Nom de fichier nettoyé et sécurisé
   */
  private sanitizeFileName(fileName: string): string {
    // Extraire l'extension du fichier
    const lastDotIndex = fileName.lastIndexOf('.');
    const extension = lastDotIndex > 0 ? fileName.substring(lastDotIndex).toLowerCase() : '';
    const nameWithoutExt = lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;

    // Nettoyer le nom : remplacer les caractères spéciaux et normaliser
    let cleaned = nameWithoutExt
      .normalize('NFD') // Décompose les caractères accentués
      .replace(/[\u0300-\u036f]/g, '') // Supprime les diacritiques
      .replace(/[^a-zA-Z0-9_-]/g, '-') // Remplace les caractères spéciaux par des tirets
      .replace(/-{2,}/g, '-') // Remplace les tirets multiples par un seul
      .replace(/^-+|-+$/g, '') // Supprime les tirets au début et à la fin
      .toLowerCase() // Convertir en minuscules pour éviter les problèmes
      .substring(0, 200); // Limite la longueur

    // Si le nom est vide après nettoyage, utiliser un nom par défaut
    if (!cleaned) {
      cleaned = 'file';
    }

    return cleaned + extension;
  }

  /**
   * Upload un fichier vers Supabase Storage
   * @param file Buffer du fichier
   * @param fileName Nom du fichier
   * @param folder Dossier dans le bucket (optionnel)
   * @returns URL publique du fichier uploadé
   */
  async uploadFile(
    file: Buffer,
    fileName: string,
    folder?: string,
  ): Promise<{ url: string; path: string }> {
    if (!this.supabase) {
      throw new Error('Supabase n\'est pas configuré. Vérifiez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.');
    }

    // Nettoyer le nom du fichier
    const sanitizedFileName = this.sanitizeFileName(fileName);
    const filePath = folder ? `${folder}/${sanitizedFileName}` : sanitizedFileName;
    
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(filePath, file, {
        contentType: this.getContentType(fileName),
        upsert: false, // Ne pas écraser les fichiers existants
      });

    if (error) {
      throw new Error(`Erreur lors de l'upload: ${error.message}`);
    }

    // Obtenir l'URL publique du fichier
    // Supabase getPublicUrl encode automatiquement le chemin, mais on doit s'assurer que le chemin est correct
    const { data: urlData } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath,
    };
  }

  /**
   * Supprime un fichier de Supabase Storage
   * @param filePath Chemin du fichier dans le bucket
   */
  async deleteFile(filePath: string): Promise<void> {
    if (!this.supabase) {
      throw new Error('Supabase n\'est pas configuré.');
    }

    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([filePath]);

    if (error) {
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  }

  /**
   * Télécharge un fichier depuis Supabase Storage
   * @param filePath Chemin du fichier dans le bucket
   * @returns Buffer du fichier
   */
  async downloadFile(filePath: string): Promise<Buffer> {
    if (!this.supabase) {
      throw new Error('Supabase n\'est pas configuré.');
    }

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .download(filePath);

    if (error) {
      throw new Error(`Erreur lors du téléchargement: ${error.message}`);
    }

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Génère une URL signée pour un téléchargement privé (valide pendant 1 heure)
   * @param filePath Chemin du fichier dans le bucket
   * @returns URL signée
   */
  async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    if (!this.supabase) {
      throw new Error('Supabase n\'est pas configuré.');
    }

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw new Error(`Erreur lors de la génération de l'URL signée: ${error.message}`);
    }

    return data.signedUrl;
  }

  /**
   * Détermine le type MIME d'un fichier basé sur son extension
   */
  private getContentType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      txt: 'text/plain',
      csv: 'text/csv',
    };

    return mimeTypes[extension || ''] || 'application/octet-stream';
  }

  /**
   * Extrait le chemin du fichier depuis une URL publique Supabase
   * @param publicUrl URL publique du fichier
   * @returns Chemin du fichier dans le bucket
   */
  extractFilePathFromPublicUrl(publicUrl: string): string | null {
    try {
      const urlParts = publicUrl.split('/');
      // Supabase public URLs are typically: SUPABASE_URL/storage/v1/object/public/BUCKET_NAME/folder/filename
      // We need 'folder/filename'
      const publicIndex = urlParts.indexOf('public');
      if (publicIndex > -1 && urlParts.length > publicIndex + 2) {
        return urlParts.slice(publicIndex + 2).join('/');
      }
      // Fallback for other URL structures or if 'public' is not found
      return urlParts.slice(-2).join('/');
    } catch (error) {
      console.error('Erreur lors de l\'extraction du chemin depuis l\'URL:', error);
      return null;
    }
  }
}

