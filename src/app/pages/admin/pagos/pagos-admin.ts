import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { finalize } from 'rxjs';

import { Pago, PagoRequest } from '../../../core/models/pago.model';
import { Comprobante } from '../../../core/models/comprobante.model';
import { PagoService } from '../../../core/services/pago.service';
import { ComprobanteService } from '../../../core/services/comprobante.service';

@Component({
  selector: 'app-pagos-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    CurrencyPipe,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './pagos-admin.html',
  styleUrl: './pagos-admin.scss'
})
export class PagosAdminPage implements OnInit {
  codigoReserva = '';
  codigoConsulta = '';

  monto: number | null = null;
  metodo = 'efectivo';
  referencia = '';

  pagos: Pago[] = [];
  comprobantes: Comprobante[] = [];
  comprobanteSeleccionado: Comprobante | null = null;

  cargandoComprobantes = false;
  registrandoPago = false;
  consultandoPagos = false;
  cargandoDetalleId: number | null = null;

  mensaje = '';
  tipoMensaje: 'exito' | 'error' | '' = '';

  constructor(
    private readonly pagoService: PagoService,
    private readonly comprobanteService: ComprobanteService
  ) {}

  ngOnInit(): void {
    this.cargarComprobantes();
  }

  get totalRecaudado(): number {
    return this.comprobantes.reduce(
      (total, comprobante) => total + Number(comprobante.monto || 0),
      0
    );
  }

  cargarComprobantes(): void {
    this.cargandoComprobantes = true;

    this.comprobanteService
      .listar()
      .pipe(finalize(() => (this.cargandoComprobantes = false)))
      .subscribe({
        next: (comprobantes) => {
          this.comprobantes = comprobantes ?? [];
        },
        error: (error) => {
          this.mostrarMensaje(
            this.obtenerMensajeError(
              error,
              'No se pudieron cargar los comprobantes.'
            ),
            'error'
          );
        }
      });
  }

  registrarPago(): void {
    const codigo = this.codigoReserva.trim().toUpperCase();

    if (!codigo) {
      this.mostrarMensaje(
        'Ingresa el código de la reserva.',
        'error'
      );
      return;
    }

    if (
      this.monto == null ||
      !Number.isFinite(this.monto) ||
      this.monto <= 0
    ) {
      this.mostrarMensaje(
        'Ingresa un monto válido mayor que cero.',
        'error'
      );
      return;
    }

    const solicitud: PagoRequest = {
      codigoReserva: codigo,
      monto: Number(this.monto),
      metodo: this.metodo,
      referencia: this.referencia.trim() || undefined
    };

    this.registrandoPago = true;
    this.limpiarMensaje();

    this.pagoService
      .registrar(solicitud)
      .pipe(finalize(() => (this.registrandoPago = false)))
      .subscribe({
        next: () => {
          this.mostrarMensaje(
            'Pago registrado correctamente. Se ha procesado la emisión del comprobante.',
            'exito'
          );

          this.monto = null;
          this.referencia = '';
          this.codigoConsulta = codigo;
          this.codigoReserva = '';

          this.consultarHistorial(codigo);
          this.cargarComprobantes();
        },
        error: (error) => {
          this.mostrarMensaje(
            this.obtenerMensajeError(
              error,
              'No se pudo registrar el pago. Verifica el código de reserva y el saldo pendiente.'
            ),
            'error'
          );
        }
      });
  }

  consultarPagos(): void {
    const codigo = this.codigoConsulta.trim().toUpperCase();

    if (!codigo) {
      this.mostrarMensaje(
        'Ingresa un código de reserva para consultar sus pagos.',
        'error'
      );
      return;
    }

    this.consultarHistorial(codigo);
  }

  verComprobante(id: number): void {
    this.cargandoDetalleId = id;
    this.limpiarMensaje();

    this.comprobanteService
      .buscarPorId(id)
      .pipe(finalize(() => (this.cargandoDetalleId = null)))
      .subscribe({
        next: (comprobante) => {
          this.comprobanteSeleccionado = comprobante;
        },
        error: (error) => {
          this.mostrarMensaje(
            this.obtenerMensajeError(
              error,
              'No se pudo cargar el detalle del comprobante.'
            ),
            'error'
          );
        }
      });
  }

  cerrarDetalle(): void {
    this.comprobanteSeleccionado = null;
  }

  nombreCliente(comprobante: Comprobante): string {
    const cliente = comprobante.pago?.reserva?.cliente;

    if (!cliente) {
      return 'No disponible';
    }

    return (
      `${cliente.nombres ?? ''} ${cliente.apellidos ?? ''}`.trim() ||
      'No disponible'
    );
  }

  codigoDeComprobante(comprobante: Comprobante): string {
    return comprobante.pago?.reserva?.codigo ?? 'No disponible';
  }

  totalPagos(): number {
    return this.pagos.reduce(
      (total, pago) => total + Number(pago.monto || 0),
      0
    );
  }

  private consultarHistorial(codigo: string): void {
    this.consultandoPagos = true;
    this.limpiarMensaje();

    this.pagoService
      .listarPorReserva(codigo)
      .pipe(finalize(() => (this.consultandoPagos = false)))
      .subscribe({
        next: (pagos) => {
          this.pagos = pagos ?? [];
          this.codigoConsulta = codigo;

          if (this.pagos.length === 0) {
            this.mostrarMensaje(
              'No se encontraron pagos para esa reserva.',
              'error'
            );
          }
        },
        error: (error) => {
          this.pagos = [];

          this.mostrarMensaje(
            this.obtenerMensajeError(
              error,
              'No se pudo consultar el historial de pagos.'
            ),
            'error'
          );
        }
      });
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

  private obtenerMensajeError(
    error: any,
    alternativa: string
  ): string {
    return (
      error?.error?.message ||
      error?.error?.mensaje ||
      (typeof error?.error === 'string' ? error.error : '') ||
      alternativa
    );
  }
}