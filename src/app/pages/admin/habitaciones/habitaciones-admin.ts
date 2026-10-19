import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
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

    this.habitacionService.listar().subscribe({
      next: habitaciones => {
        this.habitaciones = habitaciones;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las habitaciones.';
        this.cargando = false;
      }
    });
  }

  guardarHabitacion(): void {
    this.error = '';
    this.mensaje = '';

    if (
      !this.nuevaHabitacion.numero.trim() ||
      !this.nuevaHabitacion.tipo.trim() ||
      this.nuevaHabitacion.capacidad < 1 ||
      this.nuevaHabitacion.precioNoche < 0
    ) {
      this.error = 'Completa los campos correctamente.';
      return;
    }

    this.guardando = true;

    this.habitacionService.crear({
      numero: this.nuevaHabitacion.numero.trim(),
      tipo: this.nuevaHabitacion.tipo.trim(),
      capacidad: this.nuevaHabitacion.capacidad,
      precioNoche: this.nuevaHabitacion.precioNoche,
      descripcion: this.nuevaHabitacion.descripcion.trim() || null,
      estado: 'disponible'
    }).subscribe({
      next: habitacion => {
        this.habitaciones = [...this.habitaciones, habitacion];
        this.mensaje = `Habitación ${habitacion.numero} registrada correctamente.`;
        this.nuevaHabitacion = this.formularioVacio();
        this.mostrarFormulario = false;
        this.guardando = false;
      },
      error: err => {
        this.guardando = false;

        this.error = err.status === 409
          ? 'Ya existe una habitación con ese número.'
          : 'No se pudo registrar la habitación. Verifica los datos y el backend.';
      }
    });
  }

  finalizarLimpieza(habitacion: Habitacion): void {
    this.error = '';
    this.mensaje = '';

    if (habitacion.estado !== 'pendiente_limpieza') {
      return;
    }

    this.habitacionService.finalizarLimpieza(habitacion.id).subscribe({
      next: actualizada => {
        this.habitaciones = this.habitaciones.map(h =>
          h.id === actualizada.id ? actualizada : h
        );

        this.mensaje =
          `La habitación ${actualizada.numero} ahora está disponible.`;
      },
      error: () => {
        this.error = 'No se pudo actualizar el estado de limpieza.';
      }
    });
  }

  cancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.nuevaHabitacion = this.formularioVacio();
    this.error = '';
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(precio);
  }

  get disponibles(): number {
    return this.habitaciones.filter(h => h.estado === 'disponible').length;
  }

  get ocupadas(): number {
    return this.habitaciones.filter(h => h.estado === 'ocupada').length;
  }

  get pendientesLimpieza(): number {
    return this.habitaciones.filter(
      h => h.estado === 'pendiente_limpieza'
    ).length;
  }
}