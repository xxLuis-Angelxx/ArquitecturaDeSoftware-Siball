package com.epiis.Siball.service;

import com.epiis.Siball.model.Estancia;
import com.epiis.Siball.model.Habitacion;
import com.epiis.Siball.model.Reserva;
import com.epiis.Siball.repository.EstanciaRepository;
import com.epiis.Siball.repository.HabitacionRepository;
import com.epiis.Siball.repository.PagoRepository;
import com.epiis.Siball.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class EstanciaService {

    private final EstanciaRepository estanciaRepository;
    private final ReservaRepository reservaRepository;
    private final HabitacionRepository habitacionRepository;
    private final PagoRepository pagoRepository;

    public EstanciaService(
            EstanciaRepository estanciaRepository,
            ReservaRepository reservaRepository,
            HabitacionRepository habitacionRepository,
            PagoRepository pagoRepository) {
        this.estanciaRepository = estanciaRepository;
        this.reservaRepository = reservaRepository;
        this.habitacionRepository = habitacionRepository;
        this.pagoRepository = pagoRepository;
    }

    @Transactional
    public Estancia registrarCheckin(String codigoReserva) {

        Reserva reserva = reservaRepository
                .buscarPorCodigoParaActualizar(codigoReserva)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        if (!"confirmada".equalsIgnoreCase(reserva.getEstado())) {
            throw new IllegalStateException("La reserva no está confirmada");
        }

        Habitacion habitacion = habitacionRepository
                .buscarParaActualizar(reserva.getHabitacion().getId())
                .orElseThrow(() -> new RuntimeException("Habitación no encontrada"));

        if (!"disponible".equalsIgnoreCase(habitacion.getEstado())) {
            throw new IllegalStateException("La habitación no está disponible");
        }

        Estancia estancia = new Estancia();
        estancia.setReserva(reserva);
        estancia.setEstado("en_curso");

        reserva.setEstado("en_curso");
        habitacion.setEstado("ocupada");

        reservaRepository.save(reserva);
        habitacionRepository.save(habitacion);

        return estanciaRepository.save(estancia);
    }

    public List<Estancia> listarEnCurso() {
        return estanciaRepository.findByEstado("en_curso");
    }

    @Transactional
    public Estancia registrarCheckout(Integer estanciaId) {

        Estancia estancia = estanciaRepository.findById(estanciaId)
                .orElseThrow(() -> new RuntimeException("Estancia no encontrada"));

        if (!"en_curso".equalsIgnoreCase(estancia.getEstado())) {
            throw new IllegalStateException("La estancia no está en curso");
        }

        Reserva reserva = reservaRepository
                .buscarPorCodigoParaActualizar(estancia.getReserva().getCodigo())
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        BigDecimal pagado = pagoRepository.calcularTotalPagado(reserva.getId());
        BigDecimal saldo = reserva.getTotal().subtract(pagado);

        if (saldo.compareTo(BigDecimal.ZERO) != 0) {
            throw new IllegalStateException("No se puede cerrar la estancia: existe saldo pendiente");
        }

        Habitacion habitacion = habitacionRepository
                .buscarParaActualizar(reserva.getHabitacion().getId())
                .orElseThrow(() -> new RuntimeException("Habitación no encontrada"));

        estancia.setFechaCheckout(LocalDateTime.now());
        estancia.setEstado("cerrada");
        reserva.setEstado("finalizada");
        habitacion.setEstado("pendiente_limpieza");

        reservaRepository.save(reserva);
        habitacionRepository.save(habitacion);

        return estanciaRepository.save(estancia);
    }
}