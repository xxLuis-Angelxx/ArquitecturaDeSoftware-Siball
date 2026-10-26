
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, timeout } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
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
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly habitacionService = inject(HabitacionService);
  private readonly reservaService = inject(ReservaService);

  readonly auth = inject(AuthService);
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
  confirmacionAbierta = false;

  error = '';
  mensaje = '';
  reservaCreada: ReservaResponse | null = null;

  private ultimaBusquedaDesdeRuta = '';

  constructor() {
    this.route.queryParamMap.subscribe(params => {
      const idParametro = params.get('habitacionId');
      const id = idParametro ? Number(idParametro) : NaN;

      this.habitacionPreferidaId =
        Number.isInteger(id) && id > 0 ? id : null;

      const entrada = params.get('fechaEntrada');
      const salida = params.get('fechaSalida');
      const huespedes = params.get('cantidadHuespedes');

      if (!entrada || !salida) {
        this.ultimaBusquedaDesdeRuta = '';
        return;
      }

      this.fechaEntrada = entrada;
      this.fechaSalida = salida;

      if (huespedes !== null) {
        const cantidad = Number(huespedes);
        this.cantidadHuespedes = Number.isInteger(cantidad)
          ? cantidad
          : 0;
      }

      const claveBusqueda = [
        this.habitacionPreferidaId ?? '',
        this.fechaEntrada,
        this.fechaSalida,
        this.cantidadHuespedes
      ].join('|');

      if (claveBusqueda !== this.ultimaBusquedaDesdeRuta) {
        this.ultimaBusquedaDesdeRuta = claveBusqueda;
        this.buscarDisponibilidad();
      }
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
    console.log('[DEBUG] Iniciando búsqueda');

    if (this.buscando) {
      console.warn('[DEBUG] Ya hay una búsqueda en curso');
      return;
    }

    this.confirmacionAbierta = false;
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

    const cantidad = Number(this.cantidadHuespedes);

    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 20) {
      this.error =
        'La cantidad de huéspedes debe ser un número entero entre 1 y 20.';
      return;
    }

    this.cantidadHuespedes = cantidad;
    this.buscando = true;
    this.cdr.detectChanges();

    console.log('[DEBUG] Buscando:', this.buscando);
    console.log('[DEBUG] Fechas:', this.fechaEntrada, this.fechaSalida);

    this.habitacionService
      .buscarDisponibles(this.fechaEntrada, this.fechaSalida)
      .pipe(
        timeout({ first: 15000 }),
        finalize(() => {
          console.log('[DEBUG] FINALIZE ejecutado');

          this.buscando = false;
          this.cdr.detectChanges();

          console.log('[DEBUG] Estado final de buscando:', this.buscando);
        })
      )
      .subscribe({
        next: respuesta => {
          console.log('[DEBUG] NEXT ejecutado:', respuesta);

          this.habitaciones = (Array.isArray(respuesta) ? respuesta : [])
            .filter(
              habitacion =>
                Number(habitacion.capacidad) >= this.cantidadHuespedes
            );

          this.busquedaRealizada = true;

          if (this.habitacionPreferidaId !== null) {
            this.habitacionSeleccionada =
              this.habitaciones.find(
                habitacion =>
                  Number(habitacion.id) === this.habitacionPreferidaId
              ) ?? null;
          }

          if (this.habitaciones.length === 0) {
            this.mensaje =
              'No encontramos habitaciones disponibles para esas fechas y cantidad de huéspedes.';
          }

          const volverDelLogin =
            this.route.snapshot.queryParamMap.get('continuar') === '1';

          if (volverDelLogin) {
            if (!this.auth.estaAutenticado()) {
              const returnUrl = this.router.url;

              void this.router.navigate(['/login'], {
                queryParams: { returnUrl }
              });

              return;
            }

            if (this.auth.esAdmin()) {
              this.mensaje =
                'Has iniciado sesión como administrador. Para reservar necesitas una cuenta de huésped.';
            } else if (this.habitacionSeleccionada) {
              this.confirmacionAbierta = true;
            } else if (this.habitaciones.length > 0) {
              this.mensaje =
                'La habitación que elegiste ya no está disponible. Selecciona otra para continuar.';
            }

            this.limpiarParametrosDeRetorno();
          }

          this.cdr.detectChanges();
        },

        error: (err: unknown) => {
          console.error('[DEBUG] ERROR ejecutado:', err);

          this.busquedaRealizada = false;
          this.habitaciones = [];
          this.habitacionSeleccionada = null;

          if (err instanceof HttpErrorResponse) {
            if (err.status === 400) {
              this.error =
                err.error?.mensaje ??
                err.error?.detail ??
                err.error?.message ??
                'Las fechas enviadas no son válidas.';
            } else if (err.status === 404) {
              this.error =
                'No se encontró el endpoint de disponibilidad. Verifica la URL de la API.';
            } else if (err.status >= 500) {
              this.error =
                err.error?.mensaje ??
                err.error?.detail ??
                err.error?.message ??
                'El backend encontró un error al consultar las habitaciones.';
            } else if (err.status === 0) {
              this.error =
                'No se pudo completar la consulta. Verifica la conexión con el backend.';
            } else {
              this.error =
                err.error?.mensaje ??
                err.error?.detail ??
                err.error?.message ??
                'No se pudo consultar la disponibilidad.';
            }
          } else {
            this.error =
              'Ocurrió un error inesperado al procesar las habitaciones.';
          }

          this.cdr.detectChanges();
        }
      });
  }

  private limpiarParametrosDeRetorno(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        habitacionId: null,
        fechaEntrada: null,
        fechaSalida: null,
        cantidadHuespedes: null,
        continuar: null
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  seleccionarHabitacion(habitacion: Habitacion): void {
    this.habitacionSeleccionada = habitacion;
    this.habitacionPreferidaId = habitacion.id;
    this.confirmacionAbierta = false;
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

    return Math.max(0, noches) * Number(habitacion.precioNoche);
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(precio);
  }

  continuarConReserva(): void {
    this.error = '';
    this.mensaje = '';

    if (!this.habitacionSeleccionada) {
      this.error = 'Selecciona una habitación.';
      return;
    }

    if (this.auth.esAdmin()) {
      this.error =
        'Las cuentas administrativas no pueden reservar desde el portal de huéspedes.';
      return;
    }

    if (!this.auth.estaAutenticado()) {
      const returnUrl = this.router.createUrlTree(
        ['/reservas'],
        {
          queryParams: {
            habitacionId: this.habitacionSeleccionada.id,
            fechaEntrada: this.fechaEntrada,
            fechaSalida: this.fechaSalida,
            cantidadHuespedes: this.cantidadHuespedes,
            continuar: 1
          }
        }
      ).toString();

      void this.router.navigate(['/login'], {
        queryParams: { returnUrl }
      });

      return;
    }

    this.confirmacionAbierta = true;
  }

  reservar(): void {
    this.error = '';
    this.mensaje = '';

    if (this.enviando) {
      return;
    }

    if (!this.auth.estaAutenticado()) {
      this.continuarConReserva();
      return;
    }

    if (this.auth.esAdmin()) {
      this.error =
        'Las cuentas administrativas no pueden reservar desde el portal de huéspedes.';
      return;
    }

    if (!this.habitacionSeleccionada) {
      this.error = 'Selecciona una habitación.';
      return;
    }

    if (
      !this.fechaEntrada ||
      !this.fechaSalida ||
      this.fechaEntrada < this.minFecha ||
      this.fechaSalida <= this.fechaEntrada
    ) {
      this.error = 'Revisa las fechas de entrada y salida.';
      return;
    }

    if (
      !Number.isInteger(Number(this.cantidadHuespedes)) ||
      this.cantidadHuespedes < 1 ||
      this.cantidadHuespedes > this.habitacionSeleccionada.capacidad
    ) {
      this.error =
        'La cantidad de huéspedes supera la capacidad de la habitación.';
      return;
    }

    const request: ReservaRequest = {
      habitacionId: this.habitacionSeleccionada.id,
      cantidadHuespedes: this.cantidadHuespedes,
      fechaEntrada: this.fechaEntrada,
      fechaSalida: this.fechaSalida
    };

    this.enviando = true;

    this.reservaService.crear(request).pipe(
      finalize(() => {
        this.enviando = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: respuesta => {
        this.reservaCreada = respuesta;
        this.confirmacionAbierta = false;
        this.mensaje = 'Tu reserva se ha registrado correctamente.';
        this.cdr.detectChanges();

        console.log('[Reservas] Reserva creada correctamente:', respuesta);
      },

      error: (err: HttpErrorResponse) => {
        console.error('[Reservas] Error al crear reserva:', err);

        if (err.status === 401) {
          this.auth.cerrarSesion();
          this.continuarConReserva();
          return;
        }

        if (err.status === 403) {
          this.error =
            err.error?.mensaje ??
            err.error?.detail ??
            err.error?.message ??
            'Tu cuenta no tiene permiso para registrar esta reserva.';
        } else if (err.status === 409) {
          this.error =
            err.error?.mensaje ??
            err.error?.detail ??
            err.error?.message ??
            'La habitación ya tiene una reserva para esas fechas. Consulta nuevamente la disponibilidad o selecciona otras fechas.';

          this.confirmacionAbierta = false;
        } else if (err.status === 400) {
          this.error =
            err.error?.mensaje ??
            err.error?.detail ??
            err.error?.message ??
            'Revisa los datos enviados e inténtalo nuevamente.';
        } else if (err.status === 0) {
          this.error =
            'No se pudo conectar con el backend al registrar la reserva.';
        } else {
          this.error =
            err.error?.mensaje ??
            err.error?.detail ??
            err.error?.message ??
            'No se pudo registrar la reserva. Verifica la conexión e inténtalo nuevamente.';
        }

        this.cdr.detectChanges();
      }
    });
  }

  nuevaReserva(): void {
    this.reservaCreada = null;
    this.habitacionSeleccionada = null;
    this.habitaciones = [];
    this.busquedaRealizada = false;
    this.confirmacionAbierta = false;

    this.error = '';
    this.mensaje = '';

    this.fechaEntrada = '';
    this.fechaSalida = '';
    this.cantidadHuespedes = 1;
    this.habitacionPreferidaId = null;
    this.ultimaBusquedaDesdeRuta = '';

    void this.router.navigateByUrl('/reservas');
  }
}
