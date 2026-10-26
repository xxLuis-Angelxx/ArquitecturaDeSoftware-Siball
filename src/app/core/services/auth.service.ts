import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { API_CONFIG } from '../api.config';
import {
  AuthResponse,
  RegistroRequest,
  UsuarioAutenticado
} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_CONFIG.baseUrl}/auth`;

  private readonly tokenKey = 'siball_token';
  private readonly userKey = 'siball_usuario';

  private readonly usuarioSubject =
    new BehaviorSubject<UsuarioAutenticado | null>(
      this.leerUsuarioGuardado()
    );

  readonly usuario$ = this.usuarioSubject.asObservable();

  get usuario(): UsuarioAutenticado | null {
    return this.usuarioSubject.value;
  }

  iniciarSesion(
    correo: string,
    password: string
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.url}/login`, {
        correo,
        password
      })
      .pipe(
        tap(respuesta => this.guardarSesion(respuesta))
      );
  }

  registrar(
    request: RegistroRequest
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.url}/registro`, request)
      .pipe(
        tap(respuesta => this.guardarSesion(respuesta))
      );
  }

  obtenerUsuarioActual(): Observable<UsuarioAutenticado> {
    return this.http
      .get<UsuarioAutenticado>(`${this.url}/me`)
      .pipe(
        tap(usuario => {
          this.usuarioSubject.next(usuario);
          this.guardarUsuario(usuario);
        })
      );
  }

  obtenerToken(): string | null {
    try {
      if (typeof sessionStorage === 'undefined') {
        return null;
      }

      return sessionStorage.getItem(this.tokenKey);
    } catch {
      return null;
    }
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }

  esAdmin(): boolean {
    return this.usuarioSubject.value?.rol === 'ADMIN';
  }

  cerrarSesion(): void {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(this.tokenKey);
        sessionStorage.removeItem(this.userKey);
      }
    } catch {
      // Se limpia igualmente el estado que mantiene Angular en memoria.
    }

    this.usuarioSubject.next(null);
  }

  private guardarSesion(respuesta: AuthResponse): void {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(this.tokenKey, respuesta.token);
        sessionStorage.setItem(
          this.userKey,
          JSON.stringify(respuesta.usuario)
        );
      }
    } catch {
      // Se conserva la sesión en memoria si el navegador bloquea el almacenamiento.
    }

    this.usuarioSubject.next(respuesta.usuario);
  }

  private guardarUsuario(usuario: UsuarioAutenticado): void {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(
          this.userKey,
          JSON.stringify(usuario)
        );
      }
    } catch {
      // No se interrumpe la sesión si el almacenamiento está bloqueado.
    }
  }

  private leerUsuarioGuardado(): UsuarioAutenticado | null {
    try {
      if (typeof sessionStorage === 'undefined') {
        return null;
      }

      const raw = sessionStorage.getItem(this.userKey);

      return raw
        ? JSON.parse(raw) as UsuarioAutenticado
        : null;
    } catch {
      return null;
    }
  }
}