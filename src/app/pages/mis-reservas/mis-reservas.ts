
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { RouterLink, Router } from '@angular/router';

import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';

import { Reserva } from '../../core/models/reserva.model';
import { ReservaService } from '../../core/services/reserva.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './mis-reservas.html',
  styleUrl: './mis-reservas.scss'
})
export class MisReservasPage implements OnInit {
  private readonly reservaService = inject(ReservaService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  reservas: Reserva[] = [];
  cargando = true;
  error = '';

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.reservaService.listarMias().subscribe({
      next: (reservas) => {
        this.reservas = reservas;
        this.cargando = false;
        this.cdr.detectChanges();

        console.log(
          '[MisReservas] Reservas recibidas:',
          this.reservas.length
        );
      },

      error: (err) => {
        console.error('[MisReservas] Error:', err);

        this.cargando = false;

        if (err.status === 401) {
          this.error =
            'Tu sesión expiró. Inicia sesión nuevamente.';

          this.cdr.detectChanges();

          this.auth.cerrarSesion();

          void this.router.navigate(['/login'], {
            queryParams: {
              returnUrl: '/mis-reservas'
            }
          });

          return;
        }

        this.error =
          'No se pudieron cargar tus reservas. Comprueba tu conexión e inténtalo nuevamente.';

        this.cdr.detectChanges();
      }
    });
  }

  precio(valor: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(valor);
  }

  nombreHabitacion(reserva: Reserva): string {
    const habitacion = reserva.habitacion;

    return habitacion
      ? `${habitacion.tipo} · ${habitacion.numero}`
      : 'Habitación';
  }
}
