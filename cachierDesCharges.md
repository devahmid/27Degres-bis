# Prompt Optimisé - Site Web Association 27 Degrés

## 1. PRÉSENTATION DU PROJET

### Contexte
Créer un site web moderne et fonctionnel pour l'Association 27 Degrés - Basse-Ville Génération, une association communautaire gérant ses membres, cotisations et événements.

### Identité Visuelle
- **Logo fourni** : Symbole du soleil avec le chiffre "27" entouré de 4 silhouettes formant un cercle
- **Palette de couleurs** :
  - Primary: Orange/Rouge (#E94E1B)
  - Secondary: Jaune (#F5B800)
  - Accent: Vert (#7CB342)
  - Text: Bleu marine (#1A3B5C)
  - Background: Blanc cassé (#FAFAFA)
  - Gris: (#6B7280) pour textes secondaires
- **Atmosphère** : Chaleur, communauté, énergie, solidarité

---

## 2. OBJECTIFS DU SITE

### Objectif Principal
Plateforme de communication et de gestion centralisée pour l'association

### Objectifs Secondaires
1. Faciliter la gestion administrative (cotisations, adhésions)
2. Informer les membres des événements et actualités
3. Renforcer le lien communautaire
4. Partager des expériences
5. Promouvoir les activités

---

## 3. ARCHITECTURE DU SITE

### Pages Principales

#### 3.1 Page d'Accueil (`/`)
- Hero section avec présentation de l'association
- Actualités récentes (3-4 derniers posts en cards)
- Prochain événement en vedette
- Appel à cotisation si applicable
- CTA : "Devenir membre" / "Se connecter"

#### 3.2 À Propos (`/about`)
- Histoire de l'association
- Mission et valeurs
- Équipe dirigeante (bureau) avec photos
- Formulaire de contact
- Réseaux sociaux

#### 3.3 Espace Adhérents (`/member/*` - Protégé)
**Dashboard** (`/member/dashboard`)
- Statut de cotisation (badge visuel)
- Événements à venir
- Dernières actualités

**Profil** (`/member/profile`)
- Informations personnelles (éditable)
- Historique des paiements
- Préférences (annuaire, newsletter)

**Annuaire** (`/member/directory`)
- Liste des membres (avec consentement)
- Filtres et recherche
- Fiches membres

**Documents** (`/member/documents`)
- Comptes-rendus, PV d'AG
- Téléchargement de documents

**Galerie** (`/member/gallery`)
- Photos des événements par album
- Upload pour membres

#### 3.4 Cotisations (`/membership`)
**Page publique** : Montants, modalités, avantages

**Espace membre** (`/member/membership`) :
- Statut : Badge (✓ À jour / ⚠️ En attente / ❌ En retard)
- Paiement en ligne (SumUp)
- Téléchargement de reçus PDF
- Historique complet

#### 3.5 Événements (`/events`)
**Liste** (`/events`)
- Calendrier des événements à venir
- Filtres par type (weekend, réunion, activité)
- Cards avec image, date, lieu

**Détail** (`/events/:id`)
- Description complète
- Photos/vidéos éditions précédentes
- Formulaire d'inscription
- Liste participants (si autorisé)
- Informations pratiques

**Archives** (`/events/archives`)
- Événements passés avec photos

#### 3.6 Actualités (`/news`)
**Liste** (`/news`)
- Articles récents en cards
- Filtres par catégorie
- Recherche

**Article** (`/news/:slug`)
- Contenu complet
- Système de commentaires (membres uniquement)
- Partage réseaux sociaux

#### 3.7 Contact (`/contact`)
- Formulaire de contact
- Coordonnées de l'association
- Carte de localisation (si local physique)
- Liens réseaux sociaux

---

## 4. STACK TECHNIQUE

### Frontend
- **Framework** : Angular 17+ (Standalone Components)
- **UI Framework** : **Angular Material 17+** (moderne, accessible, responsive)
- **Styling** : TailwindCSS 3.x
- **Icônes** : Material Icons
- **Forms** : Reactive Forms Angular
- **HTTP** : HttpClient Angular
- **Router** : Angular Router
- **State Management** : Services + RxJS (ou NgRx si nécessaire)

### Backend
- **Framework** : NestJS (TypeScript)
- **Base de données** : **PostgreSQL 15+**
- **ORM** : **TypeORM** ou **Prisma**
- **Authentification** : JWT + Passport.js
- **Validation** : class-validator + class-transformer
- **Upload fichiers** : Multer
- **Email** : Nodemailer + SendGrid/Mailgun
- **Paiement** : SumUp API
- **PDF** : PDFKit ou Puppeteer

### DevOps
- **Version Control** : Git + GitHub
- **CI/CD** : GitHub Actions
- **Frontend Hosting** : Vercel ou Netlify
- **Backend Hosting** : Railway, Render ou AWS
- **Database Hosting** : Supabase (PostgreSQL gratuit) ou Railway
- **Storage** : Cloudinary (images) ou AWS S3

---

## 5. STRUCTURE BASE DE DONNÉES POSTGRESQL

### Tables Principales

```sql
-- Users (Membres)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'bureau', 'membre', 'visiteur')),
  phone VARCHAR(20),
  address_street VARCHAR(255),
  address_city VARCHAR(100),
  address_postal_code VARCHAR(10),
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  avatar_url VARCHAR(500),
  consent_annuaire BOOLEAN DEFAULT false,
  consent_newsletter BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cotisations
CREATE TABLE cotisations (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('paid', 'pending', 'overdue')),
  payment_date DATE,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  receipt_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, year)
);

-- Events
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(250) UNIQUE NOT NULL,
  description TEXT,
  type VARCHAR(50) CHECK (type IN ('weekend', 'reunion', 'activite')),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  location VARCHAR(255),
  max_participants INT,
  featured_image VARCHAR(500),
  status VARCHAR(20) CHECK (status IN ('draft', 'published', 'cancelled')),
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event Registrations (Table de liaison)
CREATE TABLE event_registrations (
  id SERIAL PRIMARY KEY,
  event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, user_id)
);

-- Event Images (Galerie par événement)
CREATE TABLE event_images (
  id SERIAL PRIMARY KEY,
  event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  caption TEXT,
  uploaded_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts (Actualités/Blog)
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(300) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image VARCHAR(500),
  category VARCHAR(100),
  author_id INT NOT NULL REFERENCES users(id),
  publish_date TIMESTAMP,
  status VARCHAR(20) CHECK (status IN ('draft', 'published')),
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Post Tags
CREATE TABLE post_tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

-- Post-Tag Relationship
CREATE TABLE post_tag_relations (
  post_id INT REFERENCES posts(id) ON DELETE CASCADE,
  tag_id INT REFERENCES post_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Comments
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents (PV, comptes-rendus)
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url VARCHAR(500) NOT NULL,
  file_type VARCHAR(50),
  file_size INT,
  category VARCHAR(100),
  uploaded_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact Messages
CREATE TABLE contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_cotisations_user_year ON cotisations(user_id, year);
CREATE INDEX idx_events_status_date ON events(status, start_date);
CREATE INDEX idx_posts_status_date ON posts(status, publish_date);
CREATE INDEX idx_comments_post ON comments(post_id);
```

---

## 6. ARCHITECTURE ANGULAR

### Structure des Dossiers

```
src/
├── app/
│   ├── core/                          # Services singleton, guards, interceptors
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   └── role.guard.ts
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts
│   │   │   ├── error.interceptor.ts
│   │   │   └── loading.interceptor.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── user.service.ts
│   │   │   ├── notification.service.ts
│   │   │   └── storage.service.ts
│   │   └── models/
│   │       ├── user.model.ts
│   │       ├── event.model.ts
│   │       ├── post.model.ts
│   │       └── cotisation.model.ts
│   │
│   ├── shared/                        # Composants réutilisables
│   │   ├── components/
│   │   │   ├── header/
│   │   │   ├── footer/
│   │   │   ├── loading-spinner/
│   │   │   ├── confirm-dialog/
│   │   │   └── badge-status/
│   │   ├── directives/
│   │   └── pipes/
│   │       ├── date-format.pipe.ts
│   │       └── truncate.pipe.ts
│   │
│   ├── features/                      # Modules par fonctionnalité
│   │   ├── home/
│   │   │   ├── home.component.ts
│   │   │   ├── home.component.html
│   │   │   └── home.component.scss
│   │   │
│   │   ├── about/
│   │   │   └── about.component.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   │
│   │   ├── member/                    # Zone protégée membres
│   │   │   ├── dashboard/
│   │   │   ├── profile/
│   │   │   ├── membership/
│   │   │   ├── directory/
│   │   │   ├── documents/
│   │   │   └── gallery/
│   │   │
│   │   ├── events/
│   │   │   ├── event-list/
│   │   │   ├── event-detail/
│   │   │   ├── event-registration/
│   │   │   └── services/
│   │   │       └── event.service.ts
│   │   │
│   │   ├── news/
│   │   │   ├── news-list/
│   │   │   ├── news-detail/
│   │   │   └── services/
│   │   │       └── news.service.ts
│   │   │
│   │   ├── membership/                # Page publique cotisations
│   │   │   └── membership-info.component.ts
│   │   │
│   │   ├── contact/
│   │   │   └── contact.component.ts
│   │   │
│   │   └── admin/                     # Zone admin
│   │       ├── dashboard/
│   │       ├── members-management/
│   │       ├── events-management/
│   │       ├── posts-management/
│   │       └── statistics/
│   │
│   ├── app.component.ts
│   ├── app.routes.ts                  # Routing standalone
│   └── app.config.ts                  # Configuration app
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── styles/
│       ├── _variables.scss
│       ├── _mixins.scss
│       └── _utilities.scss
│
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
│
├── styles.scss                        # Styles globaux + Tailwind
└── main.ts
```

---

## 7. COMPOSANTS ANGULAR MATERIAL À UTILISER

### Navigation
- `MatToolbar` - Header
- `MatSidenav` - Menu latéral mobile
- `MatMenu` - Menus déroulants

### Formulaires
- `MatFormField` + `MatInput` - Champs de texte
- `MatSelect` - Listes déroulantes
- `MatDatepicker` - Sélecteur de date
- `MatCheckbox` - Cases à cocher
- `MatRadioButton` - Boutons radio
- `MatSlideToggle` - Interrupteurs

### Affichage
- `MatCard` - Cards pour actualités, événements
- `MatTable` + `MatPaginator` + `MatSort` - Tableaux (admin)
- `MatTabs` - Onglets
- `MatChip` - Tags, badges
- `MatBadge` - Notifications

### Feedback
- `MatSnackBar` - Notifications toast
- `MatDialog` - Modales de confirmation
- `MatProgressSpinner` - Chargement
- `MatProgressBar` - Barre de progression

### Boutons & Actions
- `MatButton` - Boutons principaux
- `MatIconButton` - Boutons icône
- `MatFab` - Bouton flottant

---

## 8. DESIGN & EXPÉRIENCE UTILISATEUR

### 8.1 Principes de Design
- **Moderne et épuré** : Material Design 3
- **Responsive** : Mobile-first avec breakpoints Tailwind
- **Accessibilité** : WCAG 2.1 AA (contraste, navigation clavier)
- **Performance** : Lazy loading, OnPush change detection

### 8.2 Configuration Tailwind + Angular Material

**tailwind.config.js**
```javascript
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#E94E1B',
        secondary: '#F5B800',
        accent: '#7CB342',
        dark: '#1A3B5C',
        light: '#FAFAFA',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        body: ['Open Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

**Angular Material Theme personnalisé**
```scss
// styles.scss
@use '@angular/material' as mat;

$primary-palette: mat.define-palette(mat.$orange-palette, 600);
$accent-palette: mat.define-palette(mat.$amber-palette, 500);
$warn-palette: mat.define-palette(mat.$red-palette);

$theme: mat.define-light-theme((
  color: (
    primary: $primary-palette,
    accent: $accent-palette,
    warn: $warn-palette,
  ),
  typography: mat.define-typography-config(),
  density: 0,
));

@include mat.all-component-themes($theme);
```

### 8.3 Composants de Design System

Créer des composants réutilisables :

**Badge de statut cotisation**
```typescript
// shared/components/badge-status/badge-status.component.ts
@Component({
  selector: 'app-badge-status',
  standalone: true,
  imports: [CommonModule, MatChipModule],
  template: `
    <mat-chip [class]="statusClass">
      {{ statusLabel }}
    </mat-chip>
  `
})
export class BadgeStatusComponent {
  @Input() status: 'paid' | 'pending' | 'overdue' = 'pending';

  get statusLabel(): string {
    const labels = {
      paid: '✓ À jour',
      pending: '⚠️ En attente',
      overdue: '❌ En retard'
    };
    return labels[this.status];
  }

  get statusClass(): string {
    return `status-${this.status}`;
  }
}
```

---

## 9. FONCTIONNALITÉS TECHNIQUES DÉTAILLÉES

### 9.1 Authentification

**Login Flow**
```typescript
// auth.service.ts
login(email: string, password: string): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${API_URL}/auth/login`, { email, password })
    .pipe(
      tap(response => {
        this.storage.setToken(response.accessToken);
        this.storage.setUser(response.user);
        this.currentUserSubject.next(response.user);
      })
    );
}
```

**Auth Guard**
```typescript
// auth.guard.ts
canActivate(): boolean {
  if (this.authService.isLoggedIn()) {
    return true;
  }
  this.router.navigate(['/auth/login']);
  return false;
}
```

**Role Guard**
```typescript
// role.guard.ts
canActivate(route: ActivatedRouteSnapshot): boolean {
  const requiredRole = route.data['role'];
  return this.authService.hasRole(requiredRole);
}
```

### 9.2 Paiement Cotisations

**Intégration SumUp**
```typescript
// membership.service.ts
initiateSumUpPayment(cotisationData: CotisationDto): Observable<PaymentResponse> {
  return this.http.post<PaymentResponse>(
    `${API_URL}/cotisations/pay`,
    cotisationData
  ).pipe(
    tap(response => {
      // Redirection vers SumUp Checkout
      window.location.href = response.checkoutUrl;
    })
  );
}

// Webhook backend pour callback SumUp
@Post('cotisations/webhook/sumup')
async handleSumUpWebhook(@Body() payload: any) {
  // Vérifier signature
  // Mettre à jour statut cotisation
  // Générer reçu PDF
  // Envoyer email confirmation
}
```

### 9.3 Système de Notifications

**Email Templates**
```typescript
// email.service.ts (Backend NestJS)
async sendCotisationReminder(user: User) {
  await this.mailer.sendMail({
    to: user.email,
    subject: 'Rappel : Cotisation 27 Degrés 2026',
    template: 'cotisation-reminder',
    context: {
      firstName: user.firstName,
      amount: COTISATION_AMOUNT,
      paymentLink: `${FRONTEND_URL}/member/membership`
    }
  });
}
```

**Notifications in-app**
```typescript
// notification.service.ts (Frontend)
showSuccess(message: string) {
  this.snackBar.open(message, 'Fermer', {
    duration: 3000,
    panelClass: ['success-snackbar']
  });
}

showError(message: string) {
  this.snackBar.open(message, 'Fermer', {
    duration: 5000,
    panelClass: ['error-snackbar']
  });
}
```

### 9.4 Upload de Fichiers (Photos, Documents)

**Frontend**
```typescript
// file-upload.component.ts
onFileSelected(event: any) {
  const file: File = event.target.files[0];
  
  const formData = new FormData();
  formData.append('file', file);
  
  this.uploadService.uploadEventImage(eventId, formData)
    .subscribe({
      next: (response) => {
        this.notificationService.showSuccess('Photo ajoutée !');
      },
      error: (error) => {
        this.notificationService.showError('Erreur lors de l\'upload');
      }
    });
}
```

**Backend**
```typescript
// events.controller.ts
@Post(':id/images')
@UseInterceptors(FileInterceptor('file'))
async uploadImage(
  @Param('id') eventId: number,
  @UploadedFile() file: Express.Multer.File
) {
  // Upload vers Cloudinary ou S3
  const imageUrl = await this.cloudinaryService.upload(file);
  
  // Sauvegarder en base
  return this.eventsService.addImage(eventId, imageUrl);
}
```

### 9.5 Génération de Reçus PDF

```typescript
// pdf.service.ts (Backend)
async generateReceipt(cotisation: Cotisation): Promise<Buffer> {
  const doc = new PDFDocument();
  const buffers = [];
  
  doc.on('data', buffers.push.bind(buffers));
  
  // En-tête
  doc.fontSize(20).text('Reçu de Cotisation', { align: 'center' });
  doc.moveDown();
  
  // Informations
  doc.fontSize(12);
  doc.text(`Association 27 Degrés - Basse-Ville Génération`);
  doc.text(`Membre: ${cotisation.user.firstName} ${cotisation.user.lastName}`);
  doc.text(`Année: ${cotisation.year}`);
  doc.text(`Montant: ${cotisation.amount} €`);
  doc.text(`Date de paiement: ${format(cotisation.paymentDate, 'dd/MM/yyyy')}`);
  
  doc.end();
  
  return Buffer.concat(await new Promise(resolve => {
    doc.on('end', () => resolve(buffers));
  }));
}
```

---

## 10. ROUTING

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { 
    path: 'auth', 
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent }
    ]
  },
  { path: 'events', component: EventListComponent },
  { path: 'events/:id', component: EventDetailComponent },
  { path: 'news', component: NewsListComponent },
  { path: 'news/:slug', component: NewsDetailComponent },
  { path: 'membership', component: MembershipInfoComponent },
  { path: 'contact', component: ContactComponent },
  {
    path: 'member',
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: MemberDashboardComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'membership', component: MembershipPaymentComponent },
      { path: 'directory', component: DirectoryComponent },
      { path: 'documents', component: DocumentsComponent },
      { path: 'gallery', component: GalleryComponent }
    ]
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' },
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'members', component: MembersManagementComponent },
      { path: 'events', component: EventsManagementComponent },
      { path: 'posts', component: PostsManagementComponent },
      { path: 'statistics', component: StatisticsComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
```

---

## 11. FONCTIONNALITÉS PAR PHASE

### Phase 1 - MVP (4-6 semaines / 30-40h)

**Semaine 1-2 : Setup & Structure**
- [ ] Initialiser projet Angular 17 avec standalone
- [ ] Installer Angular Material + Tailwind
- [ ] Setup NestJS backend
- [ ] Setup PostgreSQL (Supabase ou local)
- [ ] Configuration TypeORM/Prisma
- [ ] Design system de base (couleurs, typographie)
- [ ] Composants shared (Header, Footer, Loading)

**Semaine 3-4 : Authentification & Pages de Base**
- [ ] Backend : API Auth (register, login, JWT)
- [ ] Frontend : Pages Login/Register
- [ ] Auth Guard + Interceptor
- [ ] Page d'accueil (hero + layout)
- [ ] Page À propos
- [ ] Page Contact (formulaire fonctionnel)

**Semaine 5-6 : Membres & Cotisations (lecture seule)**
- [ ] Backend : API Users + Cotisations (GET)
- [ ] Frontend : Dashboard membre basique
- [ ] Frontend : Profil membre (affichage)
- [ ] Frontend : Statut cotisation (badge)
- [ ] Page publique Membership (informations)

**Livrable Phase 1** : Site fonctionnel avec auth, pages principales, affichage statut cotisation

---

### Phase 2 - Enrichissement (3-4 semaines / 20-25h)

**Semaine 7-8 : Paiement & Gestion**
- [ ] Backend : Intégration SumUp API
- [ ] Backend : Génération reçus PDF
- [ ] Frontend : Page paiement cotisation
- [ ] Backend : Email service (SendGrid)
- [ ] Notifications email automatiques
- [ ] Backend : CRUD Events
- [ ] Frontend : Liste événements
- [ ] Frontend : Détail événement

**Semaine 9-10 : Blog & Admin**
- [ ] Backend : CRUD Posts + Comments
- [ ] Frontend : Liste actualités
- [ ] Frontend : Détail article + commentaires
- [ ] Frontend : Dashboard admin (liste membres)
- [ ] Frontend : Gestion cotisations admin
- [ ] Export CSV membres/cotisations

**Livrable Phase 2** : Paiement en ligne fonctionnel, événements, blog, zone admin basique

---

### Phase 3 - Avancé (2-3 semaines / 15-20h)

**Semaine 11 : Fonctionnalités Sociales**
- [ ] Annuaire membres interactif
- [ ] Galerie photos par événement
- [ ] Upload photos événements
- [ ] Inscriptions événements en ligne
- [ ] Backend : Documents (upload/download)
- [ ] Frontend : Section Documents membres

**Semaine 12 : Polish & Optimisation**
- [ ] Optimisation performance (lazy loading)
- [ ] SEO (meta tags, sitemap)
- [ ] Tests E2E critiques (Cypress)
- [ ] Responsive mobile (tests devices)
- [ ] Accessibilité (audit WCAG)
- [ ] Documentation technique

**Semaine 13 : Déploiement**
- [ ] Setup CI/CD (GitHub Actions)
- [ ] Déploiement frontend (Vercel)
- [ ] Déploiement backend (Railway)
- [ ] Configuration DNS
- [ ] Migration données initiales
- [ ] Tests production
- [ ] Formation admin

**Livrable Phase 3** : Application complète, déployée, testée, documentée

---

## 12. EXEMPLES DE COMPOSANTS CLÉS

### Dashboard Membre

```typescript
// member-dashboard.component.ts
@Component({
  selector: 'app-member-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    BadgeStatusComponent
  ],
  templateUrl: './member-dashboard.component.html',
  styleUrl: './member-dashboard.component.scss'
})
export class MemberDashboardComponent implements OnInit {
  currentUser$ = this.authService.currentUser$;
  cotisationStatus$ = this.membershipService.getCurrentYearStatus();
  upcomingEvents$ = this.eventService.getUpcoming(3);
  recentNews$ = this.newsService.getRecent(3);

  constructor(
    private authService: AuthService,
    private membershipService: MembershipService,
    private eventService: EventService,
    private newsService: NewsService
  ) {}

  ngOnInit() {
    // Les observables sont déjà définis
  }
}
```

**Template**
```html
<!-- member-dashboard.component.html -->
<div class="container mx-auto p-6">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-dark">
      Bonjour, {{ (currentUser$ | async)?.firstName }} !
    </h1>
  </div>

  <!-- Statut Cotisation -->
  <mat-card class="mb-6">
    <mat-card-header>
      <mat-card-title>Cotisation 2026</mat-card-title>
    </mat-card-header>
    <mat-card-content>
      <ng-container *ngIf="cotisationStatus$ | async as status">
        <app-badge-status [status]="status.status"></app-badge-status>
        <p class="mt-4" *ngIf="status.status === 'paid'">
          Payée le {{ status.paymentDate | date:'dd/MM/yyyy' }}
        </p>
        <p class="mt-4" *ngIf="status.status !== 'paid'">
          Montant : {{ status.amount }} €
        </p>
      </ng-container>
    </mat-card-content>
    <mat-card-actions>
      <button mat-raised-button color="primary" routerLink="/member/membership">
        Gérer ma cotisation
      </button>
    </mat-card-actions>
  </mat-card>

  <!-- Événements à venir -->
  <mat-card class="mb-6">
    <mat-card-header>
      <mat-card-title>Mes Événements</mat-card-title>
    </mat-card-header>
    <mat-card-content>
      <div *ngFor="let event of upcomingEvents$ | async" class="event-item">
        <h3>{{ event.title }}</h3>
        <p>{{ event.startDate | date:'dd/MM/yyyy' }} - {{ event.location }}</p>
        <button mat-button color="accent" [routerLink]="['/events', event.id]">
          Voir détails
        </button>
      </div>
    </mat-card-content>
  </mat-card>

  <!-- Actualités récentes -->
  <mat-card>
    <mat-card-header>
      <mat-card-title>Dernières Actualités</mat-card-title>
    </mat-card-header>
    <mat-card-content>
      <div *ngFor="let post of recentNews$ | async" class="news-item">
        <h3>{{ post.title }}</h3>
        <p>{{ post.excerpt }}</p>
        <button mat-button color="primary" [routerLink]="['/news', post.slug]">
          Lire la suite
        </button>
      </div>
    </mat-card-content>
  </mat-card>
</div>
```

---

## 13. POINTS D'ATTENTION

### RGPD
- ✅ Consentements explicites (checkboxes lors inscription)
- ✅ Page Politique de confidentialité
- ✅ Bouton "Supprimer mon compte"
- ✅ Export données personnelles (JSON)
- ✅ Durée de conservation données (mentions légales)

### Sécurité
- ✅ HTTPS obligatoire (Let's Encrypt)
- ✅ Validation côté serveur (class-validator)
- ✅ CORS configuré
- ✅ Helmet.js (headers sécurisés)
- ✅ Rate limiting (API)
- ✅ Sanitization inputs (XSS)
- ✅ CSRF protection

### Performance
- ✅ Lazy loading routes Angular
- ✅ OnPush change detection
- ✅ Images optimisées (WebP, Cloudinary)
- ✅ Pagination API (limit/offset)
- ✅ Cache HTTP (ETag, Cache-Control)
- ✅ CDN pour assets statiques

### Accessibilité
- ✅ Angular Material (accessible par défaut)
- ✅ Labels sur tous les inputs
- ✅ Contrastes WCAG AA (4.5:1)
- ✅ Navigation clavier
- ✅ ARIA attributes
- ✅ Focus visible

---

## 14. COMMANDES POUR DÉMARRER

### Frontend

```bash
# Créer projet Angular
ng new asso-27degres --routing --style=scss --standalone

cd asso-27degres

# Installer Angular Material
ng add @angular/material

# Installer Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init

# Autres dépendances
npm install @auth0/angular-jwt
npm install date-fns
npm install swiper

# Lancer dev
ng serve
```

### Backend

```bash
# Créer projet NestJS
npx @nestjs/cli new asso-27degres-api

cd asso-27degres-api

# Installer dépendances
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/passport passport passport-jwt
npm install @nestjs/jwt bcrypt
npm install class-validator class-transformer
npm install @nestjs-modules/mailer nodemailer
npm install pdfkit

# Dev dependencies
npm install -D @types/bcrypt @types/passport-jwt @types/pdfkit

# Lancer dev
npm run start:dev
```

---

## 15. CHECKLIST FINALE

### Avant Lancement
- [ ] Tests unitaires (>70% coverage critiques)
- [ ] Tests E2E (parcours utilisateur principaux)
- [ ] Audit performance (Lighthouse >90)
- [ ] Audit accessibilité (WCAG AA)
- [ ] Audit sécurité (headers, OWASP)
- [ ] Backup automatique base de données
- [ ] Monitoring (Sentry ou équivalent)
- [ ] Documentation technique
- [ ] Guide utilisateur (PDF)
- [ ] Formation admin (vidéo)

### Post-Lancement
- [ ] Collecte feedback utilisateurs (1 mois)
- [ ] Itérations correctifs bugs
- [ ] Analytics (Google Analytics)
- [ ] Newsletter aux membres (annonce)
- [ ] Support technique (email dédié)

---

## CONCLUSION

Ce prompt fournit une roadmap complète pour développer le site de l'Association 27 Degrés avec **Angular + Angular Material + PostgreSQL**.

**Stack finale** :
- ✅ Frontend : Angular 17+ Standalone + Angular Material + Tailwind
- ✅ Backend : NestJS + TypeScript
- ✅ Database : PostgreSQL + TypeORM
- ✅ Auth : JWT + Passport
- ✅ Paiement : SumUp API
- ✅ Hosting : Vercel (frontend) + Railway (backend + DB)

**Avantages de cette stack** :
- Relations SQL gérées automatiquement (TypeORM)
- Intégrité des données garantie (PostgreSQL)
- UI moderne et accessible (Angular Material)
- Performance optimale
- Maintenabilité à long terme
- Évolutivité

