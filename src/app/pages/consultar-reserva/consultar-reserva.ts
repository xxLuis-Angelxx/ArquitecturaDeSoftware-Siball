import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';
import { ReservaService } from '../../core/services/reserva.service';
import { Reserva } from '../../core/models/reserva.model';

@Component({
  selector: 'app-consultar-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './consultar-reserva.html',
  styleUrl: './consultar-reserva.scss'
})
export class ConsultarReservaPage {
  private readonly reservaService = inject(ReservaService);

  codigo = '';
  reserva: Reserva | null = null;
  buscando = false;
  error = '';

  consultar(): void {
    this.error = '';
    this.reserva = null;

    const codigoLimpio = this.codigo.trim().toUpperCase();

    if (!codigoLimpio) {
      this.error = 'Introduce el código de tu reserva.';
      return;
    }

    this.buscando = true;

    this.reservaService.buscarPorCodigo(codigoLimpio).subscribe({
      next: reserva => {
        this.reserva = reserva;
        this.buscando = false;
      },
      error: err => {
        this.buscando = false;

        if (err.status === 404) {
          this.error = 'No encontramos una reserva con ese código.';
        } else {
          this.error =
            'No se pudo consultar la reserva. Inténtalo nuevamente.';
        }
      }
    });
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

  limpiar(): void {
    this.codigo = '';
    this.reserva = null;
    this.error = '';
  }
}
