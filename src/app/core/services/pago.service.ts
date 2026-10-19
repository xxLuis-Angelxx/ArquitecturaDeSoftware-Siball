import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Pago,
  PagoRequest,
  PagoResponse
} from '../models/pago.model';

import { API_CONFIG } from '../api.config';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private readonly http = inject(HttpClient);
  private readonly url = API_CONFIG.baseUrl + API_CONFIG.endpoints.pagos;

  registrar(request: PagoRequest): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(this.url, request);
  }

  listarPorReserva(codigo: string): Observable<Pago[]> {
    return this.http.get<Pago[]>(
      `${this.url}/reserva/${encodeURIComponent(codigo)}`
    );
  }
}