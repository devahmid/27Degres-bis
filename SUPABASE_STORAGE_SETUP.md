# Configuration Supabase Storage pour l'upload de documents

Ce guide explique comment configurer Supabase Storage pour permettre l'upload de documents dans l'application.

## 1. Configuration Supabase

### Étape 1 : Créer un bucket dans Supabase

1. Connectez-vous à votre projet Supabase : https://app.supabase.com
2. Allez dans **Storage** dans le menu de gauche
3. Cliquez sur **New bucket**
4. Créez un bucket nommé `documents`
5. Configurez les permissions :
   - **Public bucket** : ✅ ACTIVÉ (nécessaire pour afficher les images publiquement)
   - **File size limit** : Selon vos besoins (ex: 10MB)
   - **Allowed MIME types** : Tous les types ou spécifiques selon vos besoins
   
   ⚠️ **IMPORTANT** : Pour que les images d'événements et d'actualités s'affichent publiquement, le bucket doit être PUBLIC.

### Étape 2 : Configurer les politiques de sécurité (RLS)

Dans Supabase, allez dans **Storage** > **Policies** pour le bucket `documents` :

**Politique pour l'upload (authentifié uniquement) :**
```sql
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');
```

**Politique pour la lecture (authentifié uniquement) :**
```sql
CREATE POLICY "Authenticated users can read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');
```

**Politique pour la suppression (admin uniquement) :**
```sql
CREATE POLICY "Admins can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.jwt() ->> 'role' = 'admin'
);
```

## 2. Configuration Backend

### Variables d'environnement

Ajoutez ces variables dans votre fichier `.env` du backend :

```env
# Supabase Configuration
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
```

### Où trouver ces valeurs ?

1. **SUPABASE_URL** : 
   - Allez dans votre projet Supabase
   - **Settings** > **API**
   - Copiez l'**URL** du projet

2. **SUPABASE_SERVICE_ROLE_KEY** :
   - Dans la même page **Settings** > **API**
   - Copiez la **service_role key** (⚠️ Ne jamais exposer cette clé côté client !)

### Exemple de fichier .env

```env
# Database
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres

# Supabase Storage
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT
JWT_SECRET=votre_secret_jwt
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=http://localhost:4200

# Environment
NODE_ENV=development
```

## 3. Utilisation de l'API

### Upload d'un document

**Endpoint :** `POST /api/documents`

**Headers :**
```
Authorization: Bearer <token_jwt>
Content-Type: multipart/form-data
```

**Body (FormData) :**
- `file` : Le fichier à uploader
- `title` : Titre du document (requis)
- `description` : Description (optionnel)
- `category` : Catégorie (optionnel)

**Exemple avec cURL :**
```bash
curl -X POST http://localhost:3000/api/documents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/chemin/vers/document.pdf" \
  -F "title=Document important" \
  -F "description=Description du document" \
  -F "category=general"
```

**Réponse :**
```json
{
  "id": 1,
  "title": "Document important",
  "description": "Description du document",
  "fileUrl": "https://xxxxx.supabase.co/storage/v1/object/public/documents/general/1234567890-document.pdf",
  "fileType": "application/pdf",
  "fileSize": 1024000,
  "category": "general",
  "uploadedBy": 1,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Lister tous les documents

**Endpoint :** `GET /api/documents`

**Réponse :**
```json
[
  {
    "id": 1,
    "title": "Document important",
    "fileUrl": "https://...",
    ...
  }
]
```

### Obtenir une URL de téléchargement signée

**Endpoint :** `GET /api/documents/:id/download`

**Headers :**
```
Authorization: Bearer <token_jwt>
```

**Réponse :**
```json
{
  "url": "https://xxxxx.supabase.co/storage/v1/object/sign/documents/general/1234567890-document.pdf?token=..."
}
```

### Supprimer un document

**Endpoint :** `DELETE /api/documents/:id`

**Headers :**
```
Authorization: Bearer <token_jwt>
```

**Permissions :** Admin ou Bureau uniquement

## 4. Utilisation côté Frontend (Angular)

### Service pour uploader des documents

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {
  private apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  uploadDocument(file: File, title: string, description?: string, category?: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (description) formData.append('description', description);
    if (category) formData.append('category', category);

    return this.http.post(this.apiUrl, formData);
  }

  getDocuments(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getDownloadUrl(id: number): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.apiUrl}/${id}/download`);
  }

  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

### Exemple de composant pour upload

```typescript
import { Component } from '@angular/core';
import { DocumentsService } from './documents.service';

@Component({
  selector: 'app-document-upload',
  template: `
    <input type="file" (change)="onFileSelected($event)" />
    <input type="text" [(ngModel)]="title" placeholder="Titre" />
    <button (click)="upload()">Uploader</button>
  `
})
export class DocumentUploadComponent {
  selectedFile: File | null = null;
  title = '';

  constructor(private documentsService: DocumentsService) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  upload() {
    if (!this.selectedFile || !this.title) {
      alert('Veuillez sélectionner un fichier et entrer un titre');
      return;
    }

    this.documentsService.uploadDocument(
      this.selectedFile,
      this.title
    ).subscribe({
      next: (document) => {
        console.log('Document uploadé:', document);
        alert('Document uploadé avec succès !');
      },
      error: (error) => {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'upload');
      }
    });
  }
}
```

## 5. Types de fichiers supportés

Par défaut, tous les types de fichiers sont supportés. Les types MIME suivants sont automatiquement détectés :

- PDF : `application/pdf`
- Word : `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Excel : `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Images : `image/jpeg`, `image/png`, `image/gif`
- Texte : `text/plain`, `text/csv`

## 6. Sécurité

⚠️ **Important :**
- La `SUPABASE_SERVICE_ROLE_KEY` ne doit **jamais** être exposée côté client
- Utilisez toujours les URLs signées pour les téléchargements privés
- Configurez correctement les politiques RLS dans Supabase
- Limitez la taille des fichiers selon vos besoins

## 7. Dépannage

### Erreur : "Supabase n'est pas configuré"
- Vérifiez que `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont bien définis dans `.env`
- Redémarrez le serveur backend après modification du `.env`

### Erreur : "Bucket not found"
- Vérifiez que le bucket `documents` existe dans Supabase Storage
- Vérifiez l'orthographe du nom du bucket

### Erreur : "Permission denied"
- Vérifiez les politiques RLS dans Supabase
- Vérifiez que l'utilisateur est bien authentifié
- Vérifiez les permissions du rôle utilisateur

