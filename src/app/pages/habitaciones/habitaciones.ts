import { Component, OnInit, inject } from '@angular/core';
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

  habitaciones: Habitacion[] = [];
  cargando = true;
  error = '';

  ngOnInit(): void {
    this.cargarHabitaciones();
  }

  cargarHabitaciones(): void {
    this.cargando = true;
    this.error = '';

    this.habitacionService.listar().subscribe({
      next: habitaciones => {
        this.habitaciones = habitaciones;
        this.cargando = false;
      },
      error: () => {
        this.error =
          'No se pudieron cargar las habitaciones. Verifica que el backend esté funcionando.';
        this.cargando = false;
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