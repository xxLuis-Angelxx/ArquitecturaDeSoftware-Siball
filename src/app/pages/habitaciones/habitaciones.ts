
import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';
import { HabitacionService } from '../../core/services/habitacion.service';
import { Habitacion } from '../../core/models/habitacion.model';

@Component({
  selector: 'app-habitaciones',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './habitaciones.html',
  styleUrl: './habitaciones.scss'
})
export class HabitacionesPage implements OnInit {
  private readonly habitacionService = inject(HabitacionService);
  private readonly cdr = inject(ChangeDetectorRef);

  habitaciones: Habitacion[] = [];
  cargando = true;
  error = '';

  ngOnInit(): void {
    console.log('[Habitaciones] Componente inicializado');
    this.cargarHabitaciones();
  }

  cargarHabitaciones(): void {
    this.cargando = true;
    this.error = '';

    this.cdr.detectChanges();

    console.log('[Habitaciones] Solicitando datos al backend...');

    this.habitacionService.listar().subscribe({
      next: (respuesta: Habitacion[]) => {
        console.log('[Habitaciones] Respuesta recibida:', respuesta);
        console.log(
          '[Habitaciones] ¿Es un arreglo?',
          Array.isArray(respuesta)
        );

        this.habitaciones = respuesta;
        this.cargando = false;

        this.cdr.detectChanges();

        console.log(
          '[Habitaciones] Cantidad:',
          this.habitaciones.length
        );

        console.log(
          '[Habitaciones] Cargando:',
          this.cargando
        );
      },

      error: (error: unknown) => {
        console.error('[Habitaciones] Error HTTP:', error);

        this.error =
          'No se pudieron cargar las habitaciones. Verifica que el backend esté funcionando.';

        this.cargando = false;

        this.cdr.detectChanges();
      },

      complete: () => {
        console.log('[Habitaciones] Solicitud completada');
      }
    });
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(precio);
  }
}
