import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { HabitacionService } from '../../../core/services/habitacion.service';
import { EstanciaService } from '../../../core/services/estancia.service';

import { Habitacion } from '../../../core/models/habitacion.model';
import { Estancia } from '../../../core/models/estancia.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardPage implements OnInit {
  private readonly habitacionService = inject(HabitacionService);
  private readonly estanciaService = inject(EstanciaService);

  habitaciones: Habitacion[] = [];
  estancias: Estancia[] = [];

  cargando = true;
  error = '';

  ngOnInit(): void {
    this.cargarDashboard();
  }

  cargarDashboard(): void {
    this.cargando = true;
    this.error = '';

    forkJoin({
      habitaciones: this.habitacionService.listar(),
      estancias: this.estanciaService.listar('en_curso')
    }).subscribe({
      next: resultado => {
        this.habitaciones = resultado.habitaciones;
        this.estancias = resultado.estancias;
        this.cargando = false;
      },
      error: () => {
        this.error =
          'No se pudieron cargar los datos. Verifica que Spring Boot y MariaDB estén funcionando.';
        this.cargando = false;
      }
    });
  }

  get totalHabitaciones(): number {
    return this.habitaciones.length;
  }

  get habitacionesDisponibles(): number {
    return this.habitaciones.filter(
      h => h.estado.toLowerCase() === 'disponible'
    ).length;
  }

  get habitacionesOcupadas(): number {
    return this.habitaciones.filter(
      h => h.estado.toLowerCase() === 'ocupada'
    ).length;
  }

  get pendientesLimpieza(): number {
    return this.habitaciones.filter(
      h => h.estado.toLowerCase() === 'pendiente_limpieza'
    ).length;
  }

  nombreHuesped(estancia: Estancia): string {
    const cliente = estancia.reserva?.cliente;

    if (!cliente) {
      return 'No disponible';
    }

    return `${cliente.nombres} ${cliente.apellidos}`;
  }
}