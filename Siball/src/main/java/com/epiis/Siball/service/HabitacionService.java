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

    public List<Habitacion> listar() {
        return habitacionRepository.findAll();
    }

    public Habitacion buscarPorId(Integer id) {
        return habitacionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Habitación no encontrada"));
    }

    public List<Habitacion> disponibles(
            LocalDate fechaEntrada,
            LocalDate fechaSalida) {

        LocalDate hoy = LocalDate.now();

        if (fechaEntrada == null || fechaSalida == null) {
            throw new IllegalArgumentException(
                    "Las fechas son obligatorias");
        }

        if (fechaEntrada.isBefore(hoy)) {
            throw new IllegalArgumentException(
                    "La fecha de entrada no puede ser pasada");
        }

        if (!fechaSalida.isAfter(fechaEntrada)) {
            throw new IllegalArgumentException(
                    "La fecha de salida debe ser posterior a la entrada");
        }

        return habitacionRepository.findAll().stream()

                // Para entradas hoy, la habitación debe estar
                // operativamente disponible.
                // Para fechas futuras, se comprueban las reservas.
                .filter(habitacion ->
                        fechaEntrada.isAfter(hoy)
                        || "disponible".equalsIgnoreCase(
                                habitacion.getEstado()))

                // Excluir habitaciones con reservas superpuestas.
                .filter(habitacion ->
                        reservaRepository.buscarReservasSuperpuestas(
                                habitacion.getId(),
                                fechaEntrada,
                                fechaSalida
                        ).isEmpty())

                .toList();
    }

    @Transactional
    public Habitacion guardar(Habitacion habitacion) {
        return habitacionRepository.save(habitacion);
    }

    @Transactional
    public Habitacion marcarDisponible(Integer id) {

        Habitacion habitacion = habitacionRepository
                .buscarParaActualizar(id)
                .orElseThrow(() ->
                        new RuntimeException("Habitación no encontrada"));

        if (!"pendiente_limpieza".equalsIgnoreCase(
                habitacion.getEstado())) {
            throw new IllegalStateException(
                    "La habitación debe estar pendiente de limpieza");
        }

        habitacion.setEstado("disponible");

        return habitacionRepository.save(habitacion);
    }
}