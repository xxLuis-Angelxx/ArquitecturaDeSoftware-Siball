
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Habitacion } from '../../../core/models/habitacion.model';
import { HabitacionService } from '../../../core/services/habitacion.service';

@Component({
  selector: 'app-habitaciones-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './habitaciones-admin.html',
  styleUrl: './habitaciones-admin.scss'
})
export class HabitacionesAdminPage implements OnInit {
  private readonly habitacionService = inject(HabitacionService);
  private readonly cdr = inject(ChangeDetectorRef);

  habitaciones: Habitacion[] = [];

  cargando = true;
  guardando = false;
  error = '';
  mensaje = '';
  mostrarFormulario = false;

  nuevaHabitacion: {
    numero: string;
    tipo: string;
    capacidad: number;
    precioNoche: number;
    descripcion: string;
    estado: Habitacion['estado'];
  } = this.formularioVacio();

  ngOnInit(): void {
    this.cargarHabitaciones();
  }

  private formularioVacio(): typeof this.nuevaHabitacion {
    return {
      numero: '',
      tipo: '',
      capacidad: 1,
      precioNoche: 0,
      descripcion: '',
      estado: 'disponible'
    };
  }

  cargarHabitaciones(): void {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.habitacionService.listar().subscribe({
      next: habitaciones => {
        this.habitaciones = habitaciones ?? [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('[HabitacionesAdmin] Error al cargar:', err);
        this.error = 'No se pudieron cargar las habitaciones. Verifica que el backend esté funcionando.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  guardarHabitacion(): void {
    this.error = '';
    this.mensaje = '';

    const numero = this.nuevaHabitacion.numero.trim();
    const tipo = this.nuevaHabitacion.tipo.trim();
    const capacidad = Number(this.nuevaHabitacion.capacidad);
    const precioNoche = Number(this.nuevaHabitacion.precioNoche);

    if (!numero || !tipo) {
      this.error = 'Introduce el número y el tipo de habitación.';
      this.cdr.detectChanges();
      return;
    }

    if (!Number.isInteger(capacidad) || capacidad < 1) {
      this.error = 'La capacidad debe ser un número entero mayor que cero.';
      this.cdr.detectChanges();
      return;
    }

    if (!Number.isFinite(precioNoche) || precioNoche < 0) {
      this.error = 'El precio por noche debe ser un número válido y no negativo.';
      this.cdr.detectChanges();
      return;
    }

    if (
      this.habitaciones.some(
        habitacion =>
          habitacion.numero.trim().toLowerCase() === numero.toLowerCase()
      )
    ) {
      this.error = 'Ya existe una habitación con ese número.';
      this.cdr.detectChanges();
      return;
    }

    this.guardando = true;
    this.cdr.detectChanges();

    this.habitacionService.crear({
      numero,
      tipo,
      capacidad,
      precioNoche,
      descripcion: this.nuevaHabitacion.descripcion.trim() || null,
      estado: 'disponible'
    }).subscribe({
      next: habitacion => {
        this.habitaciones = [
          ...this.habitaciones,
          habitacion
        ];

        this.mensaje =
          `Habitación ${habitacion.numero} registrada correctamente.`;

        this.nuevaHabitacion = this.formularioVacio();
        this.mostrarFormulario = false;
        this.guardando = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('[HabitacionesAdmin] Error al guardar:', err);

        this.guardando = false;
        this.error = err.status === 409
          ? 'Ya existe una habitación con ese número.'
          : err.error?.mensaje ??
            err.error?.message ??
            'No se pudo registrar la habitación. Verifica los datos e inténtalo nuevamente.';

        this.cdr.detectChanges();
      }
    });
  }

  finalizarLimpieza(habitacion: Habitacion): void {
    this.error = '';
    this.mensaje = '';

    if (habitacion.estado !== 'pendiente_limpieza') {
      return;
    }

    this.habitacionService
      .finalizarLimpieza(habitacion.id)
      .subscribe({
        next: actualizada => {
          this.habitaciones = this.habitaciones.map(h =>
            h.id === actualizada.id ? actualizada : h
          );

          this.mensaje =
            `La habitación ${actualizada.numero} ahora está disponible.`;

          this.cdr.detectChanges();
        },
        error: err => {
          console.error('[HabitacionesAdmin] Error de limpieza:', err);
          this.error =
            err.error?.mensaje ??
            err.error?.message ??
            'No se pudo actualizar el estado de limpieza.';

          this.cdr.detectChanges();
        }
      });
  }

  cancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.nuevaHabitacion = this.formularioVacio();
    this.error = '';
    this.mensaje = '';
    this.cdr.detectChanges();
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(precio);
  }

  get disponibles(): number {
    return this.habitaciones.filter(
      h => h.estado === 'disponible'
    ).length;
  }

  get ocupadas(): number {
    return this.habitaciones.filter(
      h => h.estado === 'ocupada'
    ).length;
  }

  get pendientesLimpieza(): number {
    return this.habitaciones.filter(
      h => h.estado === 'pendiente_limpieza'
    ).length;
  }
}
