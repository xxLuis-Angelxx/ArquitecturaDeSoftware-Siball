import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { HeaderComponent } from '../../shared/header/header';
import { FooterComponent } from '../../shared/footer/footer';

import { Habitacion } from '../../core/models/habitacion.model';
import {
  ReservaRequest,
  ReservaResponse
} from '../../core/models/reserva.model';

import { HabitacionService } from '../../core/services/habitacion.service';
import { ReservaService } from '../../core/services/reserva.service';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './reservas.html',
  styleUrl: './reservas.scss'
})
export class ReservasPage {
  private readonly route = inject(ActivatedRoute);
  private readonly habitacionService = inject(HabitacionService);
  private readonly reservaService = inject(ReservaService);

  readonly minFecha = this.obtenerFechaLocal();

  fechaEntrada = '';
  fechaSalida = '';
  cantidadHuespedes = 1;

  habitaciones: Habitacion[] = [];
  habitacionSeleccionada: Habitacion | null = null;
  habitacionPreferidaId: number | null = null;

  buscando = false;
  enviando = false;
  busquedaRealizada = false;

  error = '';
  mensaje = '';
  reservaCreada: ReservaResponse | null = null;

  cliente = {
    tipoDocumento: 'dni',
    numeroDocumento: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    correo: ''
  };

  constructor() {
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('habitacionId');
      this.habitacionPreferidaId = id ? Number(id) : null;
    });
  }

  private obtenerFechaLocal(): string {
    const fecha = new Date();

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }

  buscarDisponibilidad(): void {
    this.error = '';
    this.mensaje = '';
    this.reservaCreada = null;
    this.habitacionSeleccionada = null;
    this.habitaciones = [];
    this.busquedaRealizada = false;

    if (!this.fechaEntrada || !this.fechaSalida) {
      this.error = 'Selecciona las fechas de entrada y salida.';
      return;
    }

    if (this.fechaEntrada < this.minFecha) {
      this.error = 'La entrada no puede ser una fecha pasada.';
      return;
    }

    if (this.fechaSalida <= this.fechaEntrada) {
      this.error = 'La salida debe ser posterior a la entrada.';
      return;
    }

    if (this.cantidadHuespedes < 1) {
      this.error = 'Debe alojarse al menos un huésped.';
      return;
    }

    this.buscando = true;

    this.habitacionService.buscarDisponibles(
      this.fechaEntrada,
      this.fechaSalida
    ).subscribe({
      next: habitaciones => {
        this.habitaciones = habitaciones.filter(
          habitacion =>
            habitacion.capacidad >= this.cantidadHuespedes
        );

        this.busquedaRealizada = true;
        this.buscando = false;

        if (this.habitacionPreferidaId !== null) {
          this.habitacionSeleccionada =
            this.habitaciones.find(
              habitacion =>
                habitacion.id === this.habitacionPreferidaId
            ) ?? null;
        }

        if (this.habitaciones.length === 0) {
          this.mensaje =
            'No encontramos habitaciones disponibles para esos criterios.';
        }
      },
      error: () => {
        this.error =
          'No se pudo consultar la disponibilidad. Verifica que el backend esté funcionando.';
        this.buscando = false;
      }
    });
  }

  seleccionarHabitacion(habitacion: Habitacion): void {
    this.habitacionSeleccionada = habitacion;
    this.error = '';
    this.mensaje = '';
  }

  calcularTotal(habitacion: Habitacion): number {
    const entrada = new Date(`${this.fechaEntrada}T12:00:00`);
    const salida = new Date(`${this.fechaSalida}T12:00:00`);

    const noches = Math.round(
      (salida.getTime() - entrada.getTime()) /
      (1000 * 60 * 60 * 24)
    );

    return noches * habitacion.precioNoche;
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(precio);
  }

  reservar(): void {
    this.error = '';
    this.mensaje = '';

    if (!this.habitacionSeleccionada) {
      this.error = 'Selecciona una habitación.';
      return;
    }

    const request: ReservaRequest = {
      tipoDocumento: this.cliente.tipoDocumento,
      numeroDocumento: this.cliente.numeroDocumento.trim(),
      nombres: this.cliente.nombres.trim(),
      apellidos: this.cliente.apellidos.trim(),
      telefono: this.cliente.telefono.trim(),
      correo: this.cliente.correo.trim(),
      habitacionId: this.habitacionSeleccionada.id,
      cantidadHuespedes: this.cantidadHuespedes,
      fechaEntrada: this.fechaEntrada,
      fechaSalida: this.fechaSalida
    };

    this.enviando = true;

    this.reservaService.crear(request).subscribe({
      next: respuesta => {
        this.reservaCreada = respuesta;
        this.enviando = false;
        this.mensaje = 'Tu reserva se ha registrado correctamente.';
      },
      error: error => {
        this.enviando = false;

        if (error.status === 409) {
          this.error =
            'La habitación ya no está disponible para esas fechas. Consulta nuevamente.';
        } else if (error.status === 400) {
          this.error =
            error.error?.message ??
            'Revisa los datos enviados e inténtalo nuevamente.';
        } else {
          this.error =
            'No se pudo registrar la reserva. Verifica la conexión e inténtalo nuevamente.';
        }
      }
    });
  }

  nuevaReserva(): void {
    this.reservaCreada = null;
    this.habitacionSeleccionada = null;
    this.habitaciones = [];
    this.busquedaRealizada = false;
    this.error = '';
    this.mensaje = '';

    this.cliente = {
      tipoDocumento: 'dni',
      numeroDocumento: '',
      nombres: '',
      apellidos: '',
      telefono: '',
      correo: ''
    };
  }
}