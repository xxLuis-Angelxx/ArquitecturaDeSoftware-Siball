import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Reserva,
  ReservaRequest,
  ReservaResponse
} from '../models/reserva.model';

import { API_CONFIG } from '../api.config';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private readonly http = inject(HttpClient);
  private readonly url = API_CONFIG.baseUrl + API_CONFIG.endpoints.reservas;

  crear(request: ReservaRequest): Observable<ReservaResponse> {
    return this.http.post<ReservaResponse>(this.url, request);
  }

  listarMias(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.url}/mias`);
  }

  listarTodas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.url);
  }

  buscarPorCodigo(codigo: string): Observable<Reserva> {
    return this.http.get<Reserva>(
      `${this.url}/${encodeURIComponent(codigo)}`
    );
  }

  actualizarEstado(
    codigo: string,
    estado: 'confirmada' | 'rechazada'
  ): Observable<Reserva> {
    return this.http.patch<Reserva>(
      `${this.url}/${encodeURIComponent(codigo)}/estado`,
      { estado }
    );
  }
}