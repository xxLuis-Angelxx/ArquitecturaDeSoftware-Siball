
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';
import { ReservaService } from '../../core/services/reserva.service';
import { Reserva } from '../../core/models/reserva.model';

@Component({
  selector: 'app-consultar-reserva',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './consultar-reserva.html',
  styleUrl: './consultar-reserva.scss'
})
export class ConsultarReservaPage {
  private readonly reservaService = inject(ReservaService);
  private readonly cdr = inject(ChangeDetectorRef);

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
      this.cdr.detectChanges();
      return;
    }

    this.buscando = true;
    this.cdr.detectChanges();

    this.reservaService.buscarPorCodigo(codigoLimpio).subscribe({
      next: reserva => {
        this.reserva = reserva;
        this.buscando = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('[ConsultarReserva] Error:', err);

        this.buscando = false;
        this.reserva = null;

        if (err.status === 404) {
          this.error = 'No encontramos una reserva con ese código.';
        } else if (err.status === 401 || err.status === 403) {
          this.error = 'No tienes autorización para consultar esta reserva.';
        } else {
          this.error =
            err.error?.mensaje ??
            err.error?.message ??
            'No se pudo consultar la reserva. Inténtalo nuevamente.';
        }

        this.cdr.detectChanges();
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
    this.buscando = false;
    this.cdr.detectChanges();
  }
}
