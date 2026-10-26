import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent {
  private readonly router = inject(Router);

  readonly auth = inject(AuthService);
  readonly usuario$ = this.auth.usuario$;

  cerrarSesion(): void {
    this.auth.cerrarSesion();
    void this.router.navigateByUrl('/inicio');
  }
}