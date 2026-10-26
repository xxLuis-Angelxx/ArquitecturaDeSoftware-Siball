import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { HeaderComponent } from '../../../shared/header/header';
import { FooterComponent } from '../../../shared/footer/footer';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);

  correo = '';
  password = '';
  cargando = false;
  error = '';

  readonly routeReturnUrl =
    this.route.snapshot.queryParamMap.get('returnUrl') ?? undefined;

  iniciarSesion(): void {
    this.error = '';
    this.correo = this.correo.trim().toLowerCase();
    this.cargando = true;

    this.auth.iniciarSesion(this.correo, this.password).subscribe({
      next: respuesta => {
        const destino =
          this.route.snapshot.queryParamMap.get('returnUrl');

        this.cargando = false;

        if (destino?.startsWith('/') && !destino.startsWith('//')) {
          void this.router.navigateByUrl(destino);
        } else {
          const inicio = respuesta.usuario.rol === 'ADMIN'
            ? '/admin'
            : '/inicio';

          void this.router.navigateByUrl(inicio);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;

        if (err.status === 401) {
          this.error = 'El correo o la contraseña son incorrectos.';
        } else {
          this.error =
            err.error?.detail ??
            err.error?.message ??
            'No se pudo iniciar sesión. Revisa que el backend esté activo.';
        }
      }
    });
  }
}