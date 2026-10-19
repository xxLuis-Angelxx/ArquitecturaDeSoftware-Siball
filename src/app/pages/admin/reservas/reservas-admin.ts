import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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
export class ReservasAdminPage {
  private readonly reservaService = inject(ReservaService);

  codigo = '';
  reserva: Reserva | null = null;

  buscando = false;
  error = '';
  mensaje = '';

  consultarReserva(): void {
    this.error = '';
    this.mensaje = '';
    this.reserva = null;

    const codigoLimpio = this.codigo.trim().toUpperCase();

    if (!codigoLimpio) {
      this.error = 'Introduce el código de la reserva.';
      return;
    }

    this.buscando = true;

    this.reservaService.buscarPorCodigo(codigoLimpio).subscribe({
      next: reserva => {
        this.reserva = reserva;
        this.buscando = false;
        this.mensaje = 'Reserva encontrada correctamente.';
      },
      error: () => {
        this.buscando = false;
        this.error =
          'No se pudo consultar la reserva. Verifica el código y que el backend esté funcionando.';
      }
    });
  }

  limpiarBusqueda(): void {
    this.codigo = '';
    this.reserva = null;
    this.error = '';
    this.mensaje = '';
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(precio);
  }

  formatearEstado(estado: string): string {
    const estados: Record<string, string> = {
      confirmada: 'Confirmada',
      en_curso: 'En curso',
      finalizada: 'Finalizada',
      cancelada: 'Cancelada',
      pendiente: 'Pendiente',
      parcial: 'Pago parcial',
      pagado: 'Pagado'
    };

    return estados[estado?.toLowerCase()] ?? estado;
  }

  claseEstado(estado: string): string {
    const valor = estado?.toLowerCase();

    if (valor === 'confirmada' || valor === 'pagado') {
      return 'success';
    }

    if (valor === 'en_curso' || valor === 'parcial') {
      return 'warning';
    }

    if (valor === 'finalizada' || valor === 'cancelada') {
      return 'neutral';
    }

    return 'pending';
  }
}