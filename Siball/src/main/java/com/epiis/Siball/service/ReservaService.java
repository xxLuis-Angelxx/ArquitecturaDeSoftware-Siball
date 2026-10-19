package com.epiis.Siball.service;

import com.epiis.Siball.dto.ReservaRequest;
import com.epiis.Siball.dto.ReservaResponse;
import com.epiis.Siball.model.Cliente;
import com.epiis.Siball.model.Habitacion;
import com.epiis.Siball.model.Reserva;
import com.epiis.Siball.repository.ClienteRepository;
import com.epiis.Siball.repository.HabitacionRepository;
import com.epiis.Siball.repository.ReservaRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final ClienteRepository clienteRepository;
    private final HabitacionRepository habitacionRepository;

    public ReservaService(
            ReservaRepository reservaRepository,
            ClienteRepository clienteRepository,
            HabitacionRepository habitacionRepository) {

        this.reservaRepository = reservaRepository;
        this.clienteRepository = clienteRepository;
        this.habitacionRepository = habitacionRepository;
    }

    @Transactional
    public ReservaResponse crear(ReservaRequest request) {

        LocalDate hoy = LocalDate.now();

        // Validar fechas
        if (request.getFechaEntrada() == null
                || request.getFechaSalida() == null) {
            throw new IllegalArgumentException(
                    "Las fechas son obligatorias");
        }

        if (request.getFechaEntrada().isBefore(hoy)) {
            throw new IllegalArgumentException(
                    "La fecha de entrada no puede ser pasada");
        }

        if (!request.getFechaSalida()
                .isAfter(request.getFechaEntrada())) {
            throw new IllegalArgumentException(
                    "La salida debe ser posterior a la entrada");
        }

        // Validar cantidad de huéspedes
        if (request.getCantidadHuespedes() == null
                || request.getCantidadHuespedes() < 1) {
            throw new IllegalArgumentException(
                    "La cantidad de huéspedes debe ser al menos 1");
        }

        // Bloquear la habitación durante la operación
        Habitacion habitacion = habitacionRepository
                .buscarParaActualizar(request.getHabitacionId())
                .orElseThrow(() ->
                        new RuntimeException("Habitación no encontrada"));

        // Validar capacidad
        if (request.getCantidadHuespedes()
                > habitacion.getCapacidad()) {
            throw new IllegalArgumentException(
                    "La habitación no tiene capacidad suficiente");
        }

        // Para una entrada hoy, debe estar lista en este momento.
        // Para fechas futuras, el estado actual no determina
        // por sí solo la disponibilidad de esas fechas.
        if (request.getFechaEntrada().equals(hoy)
                && !"disponible".equalsIgnoreCase(
                        habitacion.getEstado())) {
            throw new IllegalStateException(
                    "La habitación no está disponible para entrada hoy");
        }

        // Comprobar conflictos con otras reservas
        if (!reservaRepository.buscarReservasSuperpuestas(
                habitacion.getId(),
                request.getFechaEntrada(),
                request.getFechaSalida()
        ).isEmpty()) {
            throw new IllegalStateException(
                    "La habitación ya está reservada para esas fechas");
        }

        // Buscar cliente existente o registrar uno nuevo
        Cliente cliente = clienteRepository
                .findByTipoDocumentoAndNumeroDocumento(
                        request.getTipoDocumento(),
                        request.getNumeroDocumento())
                .orElseGet(Cliente::new);

        cliente.setTipoDocumento(request.getTipoDocumento());
        cliente.setNumeroDocumento(request.getNumeroDocumento());
        cliente.setNombres(request.getNombres());
        cliente.setApellidos(request.getApellidos());
        cliente.setTelefono(request.getTelefono());
        cliente.setCorreo(request.getCorreo());

        cliente = clienteRepository.save(cliente);

        // Calcular importe total
        long noches = ChronoUnit.DAYS.between(
                request.getFechaEntrada(),
                request.getFechaSalida());

        BigDecimal total = habitacion.getPrecioNoche()
                .multiply(BigDecimal.valueOf(noches));

        // Crear reserva
        Reserva reserva = new Reserva();

        reserva.setCodigo(
                "SB-" + UUID.randomUUID()
                        .toString()
                        .substring(0, 6)
                        .toUpperCase());

        reserva.setCliente(cliente);
        reserva.setHabitacion(habitacion);
        reserva.setCantidadHuespedes(
                request.getCantidadHuespedes());
        reserva.setFechaEntrada(request.getFechaEntrada());
        reserva.setFechaSalida(request.getFechaSalida());
        reserva.setTotal(total);
        reserva.setEstado("confirmada");
        reserva.setEstadoPago("pendiente");

        reserva = reservaRepository.save(reserva);

        return new ReservaResponse(
                reserva.getCodigo(),
                reserva.getEstado(),
                reserva.getTotal());
    }

    public Reserva buscarPorCodigo(String codigo) {
        return reservaRepository.findByCodigo(codigo)
                .orElseThrow(() ->
                        new RuntimeException("Reserva no encontrada"));
    }
}