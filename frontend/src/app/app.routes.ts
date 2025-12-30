import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
      }
    ]
  },
  {
    path: 'events',
    loadComponent: () => import('./features/events/event-list/event-list.component').then(m => m.EventListComponent)
  },
  {
    path: 'events/:id',
    loadComponent: () => import('./features/events/event-detail/event-detail.component').then(m => m.EventDetailComponent)
  },
  {
    path: 'news',
    loadComponent: () => import('./features/news/news-list/news-list.component').then(m => m.NewsListComponent)
  },
  {
    path: 'news/:slug',
    loadComponent: () => import('./features/news/news-detail/news-detail.component').then(m => m.NewsDetailComponent)
  },
  {
    path: 'membership',
    loadComponent: () => import('./features/membership/membership-info.component').then(m => m.MembershipInfoComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'gallery',
    loadComponent: () => import('./features/gallery/public-gallery.component').then(m => m.PublicGalleryComponent)
  },
  {
    path: 'shop',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/shop/shop.component').then(m => m.ShopComponent)
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/shop/cart/cart.component').then(m => m.CartComponent)
      },
      {
        path: 'checkout',
        canActivate: [authGuard],
        loadComponent: () => import('./features/shop/checkout/checkout.component').then(m => m.CheckoutComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/shop/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
      }
    ]
  },
  {
    path: 'member',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/layouts/member-layout/member-layout.component').then(m => m.MemberLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/member/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/member/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'membership',
        loadComponent: () => import('./features/member/membership/membership.component').then(m => m.MembershipComponent)
      },
      {
        path: 'directory',
        loadComponent: () => import('./features/member/directory/directory.component').then(m => m.DirectoryComponent)
      },
      {
        path: 'documents',
        loadComponent: () => import('./features/member/documents/documents.component').then(m => m.DocumentsComponent)
      },
      {
        path: 'gallery',
        loadComponent: () => import('./features/member/gallery/gallery.component').then(m => m.GalleryComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/member/my-orders/my-orders.component').then(m => m.MyOrdersComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' },
    loadComponent: () => import('./shared/layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'members',
        loadComponent: () => import('./features/admin/members-management/members-management.component').then(m => m.MembersManagementComponent)
      },
      {
        path: 'cotisations',
        loadComponent: () => import('./features/admin/cotisations-management/cotisations-management.component').then(m => m.CotisationsManagementComponent)
      },
      {
        path: 'events',
        loadComponent: () => import('./features/admin/events-management/events-management.component').then(m => m.EventsManagementComponent)
      },
      {
        path: 'posts',
        loadComponent: () => import('./features/admin/posts-management/posts-management.component').then(m => m.PostsManagementComponent)
      },
      {
        path: 'comments',
        loadComponent: () => import('./features/admin/comments-management/comments-management.component').then(m => m.CommentsManagementComponent)
      },
      {
        path: 'gallery',
        loadComponent: () => import('./features/admin/gallery-management/gallery-management.component').then(m => m.GalleryManagementComponent)
      },
      {
        path: 'statistics',
        loadComponent: () => import('./features/admin/statistics/statistics.component').then(m => m.StatisticsComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./features/admin/products-management/products-management.component').then(m => m.ProductsManagementComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/admin/orders-management/orders-management.component').then(m => m.OrdersManagementComponent)
      },
      {
        path: 'delivery-methods',
        loadComponent: () => import('./features/admin/delivery-methods-management/delivery-methods-management.component').then(m => m.DeliveryMethodsManagementComponent)
      },
      {
        path: 'contact-messages',
        loadComponent: () => import('./features/admin/contact-messages-management/contact-messages-management.component').then(m => m.ContactMessagesManagementComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

