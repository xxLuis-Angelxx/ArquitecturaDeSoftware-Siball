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
import { RegistroRequest } from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './registro.html',
  styleUrl: './registro.scss'
})
export class RegistroPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);

  tipoDocumento = 'dni';
  numeroDocumento = '';
  nombres = '';
  apellidos = '';
  telefono = '';
  correo = '';
  password = '';
  confirmarPassword = '';

  cargando = false;
  error = '';

  readonly routeReturnUrl =
    this.route.snapshot.queryParamMap.get('returnUrl') ?? undefined;

  registrar(): void {
    this.error = '';

    if (this.password !== this.confirmarPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    if (this.password.length < 8) {
      this.error = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }

    const request: RegistroRequest = {
      tipoDocumento: this.tipoDocumento,
      numeroDocumento: this.numeroDocumento.trim(),
      nombres: this.nombres.trim(),
      apellidos: this.apellidos.trim(),
      telefono: this.telefono.trim(),
      correo: this.correo.trim().toLowerCase(),
      password: this.password
    };

    this.cargando = true;

    this.auth.registrar(request).subscribe({
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

        if (err.status === 409) {
          this.error =
            err.error?.detail ??
            err.error?.message ??
            'Ya existe una cuenta con ese correo o documento.';
        } else if (err.status === 400) {
          this.error =
            err.error?.detail ??
            err.error?.message ??
            'Revisa los datos ingresados.';
        } else {
          this.error =
            'No se pudo crear la cuenta. Verifica que el backend esté funcionando.';
        }
      }
    });
  }
}