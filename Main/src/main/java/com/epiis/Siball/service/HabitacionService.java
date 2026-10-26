
package com.epiis.Siball.service;

import com.epiis.Siball.model.Habitacion;
import com.epiis.Siball.repository.HabitacionRepository;
import com.epiis.Siball.repository.ReservaRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class HabitacionService {

    private final HabitacionRepository habitacionRepository;
    private final ReservaRepository reservaRepository;

    public HabitacionService(
            HabitacionRepository habitacionRepository,
            ReservaRepository reservaRepository) {
        this.habitacionRepository = habitacionRepository;
        this.reservaRepository = reservaRepository;
    }

    @Transactional(readOnly = true)
    public List<Habitacion> listar() {
        return habitacionRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Habitacion buscarPorId(Integer id) {
        return habitacionRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Habitación no encontrada: " + id));
    }

    @Transactional(readOnly = true)
    public List<Habitacion> disponibles(
            LocalDate fechaEntrada,
            LocalDate fechaSalida) {

        LocalDate hoy = LocalDate.now();

        if (fechaEntrada == null || fechaSalida == null) {
            throw new IllegalArgumentException(
                    "Las fechas de entrada y salida son obligatorias.");
        }

        if (fechaEntrada.isBefore(hoy)) {
            throw new IllegalArgumentException(
                    "La fecha de entrada no puede ser pasada.");
        }

        if (!fechaSalida.isAfter(fechaEntrada)) {
            throw new IllegalArgumentException(
                    "La fecha de salida debe ser posterior a la entrada.");
        }

        List<Habitacion> habitaciones = habitacionRepository.findAll();

        return habitaciones.stream()
                .filter(habitacion -> {
                    if (habitacion.getId() == null) {
                        return false;
                    }

                    // Para entradas hoy, solo se permiten habitaciones
                    // cuyo estado operativo sea disponible.
                    if (!fechaEntrada.isAfter(hoy)
                            && !"disponible".equalsIgnoreCase(
                                    habitacion.getEstado())) {
                        return false;
                    }

                    // Excluir habitaciones que tengan reservas
                    // pendientes, confirmadas o en curso que se crucen
                    // con las fechas solicitadas.
                    return reservaRepository
                            .buscarReservasSuperpuestas(
                                    habitacion.getId(),
                                    fechaEntrada,
                                    fechaSalida)
                            .isEmpty();
                })
                .toList();
    }

    @Transactional
    public Habitacion guardar(Habitacion habitacion) {
        if (habitacion == null) {
            throw new IllegalArgumentException(
                    "Los datos de la habitación son obligatorios.");
        }

        return habitacionRepository.save(habitacion);
    }

    @Transactional
    public Habitacion marcarDisponible(Integer id) {
        Habitacion habitacion = habitacionRepository
                .buscarParaActualizar(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Habitación no encontrada: " + id));

        if (!"pendiente_limpieza".equalsIgnoreCase(
                habitacion.getEstado())) {
            throw new IllegalStateException(
                    "La habitación debe estar pendiente de limpieza.");
        }

        habitacion.setEstado("disponible");

        return habitacionRepository.save(habitacion);
    }
}
