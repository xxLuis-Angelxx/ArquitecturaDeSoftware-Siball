import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { finalize } from 'rxjs';

import { Estancia } from '../../../core/models/estancia.model';
import { EstanciaService } from '../../../core/services/estancia.service';

@Component({
  selector: 'app-estancias-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './estancias-admin.html',
  styleUrl: './estancias-admin.scss'
})
export class EstanciasAdminPage implements OnInit {
  estancias: Estancia[] = [];

  codigoReserva = '';

  cargando = false;
  registrandoCheckin = false;
  procesandoCheckoutId: number | null = null;

  mensaje = '';
  tipoMensaje: 'exito' | 'error' | '' = '';

  constructor(private readonly estanciaService: EstanciaService) {}

  ngOnInit(): void {
    this.cargarEstancias();
  }

  cargarEstancias(): void {
    this.cargando = true;

    this.estanciaService
      .listar('en_curso')
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (estancias) => {
          this.estancias = estancias ?? [];
        },
        error: (error) => {
          this.mostrarMensaje(
            this.obtenerMensajeError(
              error,
              'No se pudieron cargar las estancias activas.'
            ),
            'error'
          );
        }
      });
  }

  registrarCheckin(): void {
    const codigo = this.codigoReserva.trim().toUpperCase();

    if (!codigo) {
      this.mostrarMensaje(
        'Ingresa el código de la reserva para registrar el check-in.',
        'error'
      );
      return;
    }

    this.registrandoCheckin = true;
    this.limpiarMensaje();

    this.estanciaService
      .checkin({ codigoReserva: codigo })
      .pipe(finalize(() => (this.registrandoCheckin = false)))
      .subscribe({
        next: () => {
          this.codigoReserva = '';

          this.mostrarMensaje(
            'Check-in registrado correctamente.',
            'exito'
          );

          this.cargarEstancias();
        },
        error: (error) => {
          this.mostrarMensaje(
            this.obtenerMensajeError(
              error,
              'No se pudo registrar el check-in. Verifica el código y el estado de la reserva.'
            ),
            'error'
          );
        }
      });
  }

  registrarCheckout(estancia: Estancia): void {
    if (estancia.id == null) {
      this.mostrarMensaje(
        'No se encontró el identificador de la estancia.',
        'error'
      );
      return;
    }

    if (
      !confirm(
        `¿Confirmas el checkout de la habitación ${estancia.reserva.habitacion.numero}?`
      )
    ) {
      return;
    }

    this.procesandoCheckoutId = estancia.id;
    this.limpiarMensaje();

    this.estanciaService
      .checkout(estancia.id)
      .pipe(finalize(() => (this.procesandoCheckoutId = null)))
      .subscribe({
        next: () => {
          this.estancias = this.estancias.filter(
            (item) => item.id !== estancia.id
          );

          this.mostrarMensaje(
            'Checkout registrado correctamente. La habitación queda pendiente de limpieza.',
            'exito'
          );
        },
        error: (error) => {
          this.mostrarMensaje(
            this.obtenerMensajeError(
              error,
              'No se pudo registrar el checkout. Comprueba que la reserva no tenga pagos pendientes.'
            ),
            'error'
          );
        }
      });
  }

  nombreCompleto(estancia: Estancia): string {
    const cliente = estancia.reserva.cliente;

    return `${cliente.nombres} ${cliente.apellidos}`.trim();
  }

  private mostrarMensaje(
    mensaje: string,
    tipo: 'exito' | 'error'
  ): void {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
  }

  private limpiarMensaje(): void {
    this.mensaje = '';
    this.tipoMensaje = '';
  }

  private obtenerMensajeError(error: any, alternativa: string): string {
    return (
      error?.error?.message ||
      error?.error?.mensaje ||
      (typeof error?.error === 'string' ? error.error : '') ||
      alternativa
    );
  }
}