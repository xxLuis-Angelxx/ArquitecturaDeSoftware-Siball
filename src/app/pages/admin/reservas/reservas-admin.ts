import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Reserva } from '../../../core/models/reserva.model';
import { ReservaService } from '../../../core/services/reserva.service';

@Component({
  selector: 'app-reservas-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reservas-admin.html',
  styleUrl: './reservas-admin.scss'
})
export class ReservasAdminPage implements OnInit {
  private readonly reservaService = inject(ReservaService);
  private readonly cdr = inject(ChangeDetectorRef);

  reservas: Reserva[] = [];
  reservasFiltradas: Reserva[] = [];

  filtroEstado = 'todas';
  busqueda = '';

  cargando = false;
  procesandoCodigo: string | null = null;
  error = '';
  mensaje = '';

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.reservaService.listarTodas().subscribe({
      next: reservas => {
        this.reservas = reservas ?? [];
        this.aplicarFiltros();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: err => {
        this.cargando = false;
        this.error = err.status === 403
          ? 'No tienes permisos para consultar las reservas.'
          : 'No se pudieron cargar las reservas. Verifica que el backend esté funcionando.';

        this.cdr.detectChanges();
      }
    });
  }

  aplicarFiltros(): void {
    const texto = this.busqueda.trim().toLowerCase();

    this.reservasFiltradas = this.reservas.filter(reserva => {
      const coincideEstado =
        this.filtroEstado === 'todas' ||
        reserva.estado?.toLowerCase() === this.filtroEstado;

      const nombreCliente =
        `${reserva.cliente?.nombres ?? ''} ${reserva.cliente?.apellidos ?? ''}`
          .toLowerCase();

      const coincideTexto =
        !texto ||
        reserva.codigo?.toLowerCase().includes(texto) ||
        nombreCliente.includes(texto) ||
        reserva.habitacion?.numero?.toLowerCase().includes(texto);

      return coincideEstado && coincideTexto;
    });
  }

  cambiarFiltro(estado: string): void {
    this.filtroEstado = estado;
    this.aplicarFiltros();
  }

  confirmarReserva(reserva: Reserva): void {
    this.actualizarEstado(reserva, 'confirmada');
  }

  rechazarReserva(reserva: Reserva): void {
    this.actualizarEstado(reserva, 'rechazada');
  }

  private actualizarEstado(
    reserva: Reserva,
    estado: 'confirmada' | 'rechazada'
  ): void {
    if (reserva.estado?.toLowerCase() !== 'pendiente') {
      return;
    }

    const accion = estado === 'confirmada' ? 'confirmar' : 'rechazar';

    if (!window.confirm(`¿Deseas ${accion} la reserva ${reserva.codigo}?`)) {
      return;
    }

    this.error = '';
    this.mensaje = '';
    this.procesandoCodigo = reserva.codigo;
    this.cdr.detectChanges();

    this.reservaService.actualizarEstado(reserva.codigo, estado).subscribe({
      next: actualizada => {
        this.reservas = this.reservas.map(item =>
          item.codigo === actualizada.codigo ? actualizada : item
        );

        this.aplicarFiltros();
        this.procesandoCodigo = null;
        this.mensaje = estado === 'confirmada'
          ? `La reserva ${actualizada.codigo} fue confirmada.`
          : `La reserva ${actualizada.codigo} fue rechazada.`;

        this.cdr.detectChanges();
      },
      error: err => {
        this.procesandoCodigo = null;
        this.error = err.error?.message ||
          (err.status === 403
            ? 'No tienes permisos para gestionar reservas.'
            : 'No se pudo actualizar la reserva. Recarga la lista e inténtalo nuevamente.');

        this.cdr.detectChanges();
      }
    });
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(precio ?? 0);
  }

  formatearEstado(estado: string): string {
    const estados: Record<string, string> = {
      pendiente: 'Pendiente de revisión',
      confirmada: 'Confirmada',
      rechazada: 'Rechazada',
      cancelada: 'Cancelada',
      en_curso: 'En curso',
      finalizada: 'Finalizada',
      parcial: 'Pago parcial',
      pagado: 'Pagado',
      pendiente_pago: 'Pendiente de pago'
    };

    return estados[estado?.toLowerCase()] ?? estado ?? 'Sin estado';
  }

  claseEstado(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'confirmada':
      case 'pagado':
        return 'success';

      case 'en_curso':
      case 'parcial':
        return 'warning';

      case 'rechazada':
      case 'cancelada':
      case 'finalizada':
        return 'neutral';

      default:
        return 'pending';
    }
  }

  get pendientes(): number {
    return this.reservas.filter(
      reserva => reserva.estado?.toLowerCase() === 'pendiente'
    ).length;
  }

  get confirmadas(): number {
    return this.reservas.filter(
      reserva => reserva.estado?.toLowerCase() === 'confirmada'
    ).length;
  }

  get rechazadas(): number {
    return this.reservas.filter(
      reserva => reserva.estado?.toLowerCase() === 'rechazada'
    ).length;
  }
}