import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override canActivate pour permettre l'accès même sans token
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Toujours retourner true pour permettre l'accès
    // Le guard essaiera quand même d'extraire le token si présent
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    // Si pas de token, permettre l'accès sans authentification
    if (!token) {
      return true;
    }
    
    // Si token présent, essayer de l'authentifier
    return super.canActivate(context) as Promise<boolean>;
  }

  // Override handleRequest pour ne pas lancer d'erreur si pas de token ou token invalide
  handleRequest(err: any, user: any, info: any) {
    // Si erreur ou pas d'utilisateur, retourner undefined (pas d'erreur)
    if (err || !user) {
      return undefined;
    }
    return user;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

