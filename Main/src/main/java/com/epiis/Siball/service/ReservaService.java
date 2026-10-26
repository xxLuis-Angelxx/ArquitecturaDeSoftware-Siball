
package com.epiis.Siball.service;

import com.epiis.Siball.dto.ReservaRequest;
import com.epiis.Siball.dto.ReservaResponse;
import com.epiis.Siball.model.Cliente;
import com.epiis.Siball.model.Habitacion;
import com.epiis.Siball.model.Reserva;
import com.epiis.Siball.model.Usuario;
import com.epiis.Siball.repository.HabitacionRepository;
import com.epiis.Siball.repository.ReservaRepository;
import com.epiis.Siball.repository.UsuarioRepository;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final HabitacionRepository habitacionRepository;
    private final UsuarioRepository usuarioRepository;

    public ReservaService(
            ReservaRepository reservaRepository,
            HabitacionRepository habitacionRepository,
            UsuarioRepository usuarioRepository) {

        this.reservaRepository = reservaRepository;
        this.habitacionRepository = habitacionRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public ReservaResponse crear(
            ReservaRequest request,
            String correoUsuario) {

        if (correoUsuario == null || correoUsuario.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Debes iniciar sesión para reservar"
            );
        }

        Usuario usuario = usuarioRepository
                .findByCorreoIgnoreCaseAndActivoTrue(correoUsuario.trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "La cuenta no está activa o no existe"
                ));

        Cliente cliente = usuario.getCliente();

        if (cliente == null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Tu cuenta no tiene un perfil de cliente asociado"
            );
        }

        if (request == null || request.getHabitacionId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debes seleccionar una habitación"
            );
        }

        LocalDate entrada = request.getFechaEntrada();
        LocalDate salida = request.getFechaSalida();
        LocalDate hoy = LocalDate.now();

        if (entrada == null || salida == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Las fechas de entrada y salida son obligatorias"
            );
        }

        if (entrada.isBefore(hoy)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La fecha de entrada no puede ser pasada"
            );
        }

        if (!salida.isAfter(entrada)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La fecha de salida debe ser posterior a la entrada"
            );
        }

        Integer huespedes = request.getCantidadHuespedes();

        if (huespedes == null || huespedes < 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La cantidad de huéspedes debe ser al menos 1"
            );
        }

        Habitacion habitacion = habitacionRepository
                .buscarParaActualizar(request.getHabitacionId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Habitación no encontrada"
                ));

        if (habitacion.getCapacidad() == null
                || huespedes > habitacion.getCapacidad()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La habitación no tiene capacidad suficiente"
            );
        }

        if (!"disponible".equalsIgnoreCase(habitacion.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La habitación no está disponible actualmente"
            );
        }

        List<Reserva> conflictos =
                reservaRepository.buscarReservasSuperpuestas(
                        habitacion.getId(),
                        entrada,
                        salida
                );

        boolean tieneConflicto = conflictos.stream()
                .anyMatch(reserva ->
                        !"rechazada".equalsIgnoreCase(reserva.getEstado()));

        if (tieneConflicto) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La habitación ya tiene una solicitud o reserva para esas fechas"
            );
        }

        long noches = ChronoUnit.DAYS.between(entrada, salida);

        BigDecimal precioNoche = habitacion.getPrecioNoche();

        if (precioNoche == null || precioNoche.signum() < 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La habitación tiene un precio inválido"
            );
        }

        BigDecimal total = precioNoche.multiply(BigDecimal.valueOf(noches));

        Reserva reserva = new Reserva();
        reserva.setCodigo(
                "SB-" + UUID.randomUUID()
                        .toString()
                        .substring(0, 6)
                        .toUpperCase(Locale.ROOT)
        );
        reserva.setCliente(cliente);
        reserva.setHabitacion(habitacion);
        reserva.setCantidadHuespedes(huespedes);
        reserva.setFechaEntrada(entrada);
        reserva.setFechaSalida(salida);
        reserva.setTotal(total);
        reserva.setEstado("pendiente");
        reserva.setEstadoPago("pendiente");

        reserva = reservaRepository.save(reserva);

        return new ReservaResponse(
                reserva.getCodigo(),
                reserva.getEstado(),
                reserva.getTotal()
        );
    }

    @Transactional(readOnly = true)
    public List<Reserva> listarTodas() {
        return reservaRepository.findAll(
                Sort.by(Sort.Direction.DESC, "fechaCreacion")
        );
    }

    @Transactional(readOnly = true)
    public List<Reserva> listarMias(String correo) {
        if (correo == null || correo.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Usuario no autenticado"
            );
        }

        Usuario usuario = usuarioRepository
                .findByCorreoIgnoreCaseAndActivoTrue(correo.trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "La cuenta no está activa o no existe"
                ));

        Cliente cliente = usuario.getCliente();

        if (cliente == null) {
            return List.of();
        }

        return reservaRepository.findByCliente_IdOrderByFechaCreacionDesc(
                cliente.getId()
        );
    }

    @Transactional(readOnly = true)
    public Reserva buscarPorCodigo(String codigo) {
        if (codigo == null || codigo.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El código de reserva es obligatorio"
            );
        }

        return reservaRepository.findByCodigo(codigo.trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Reserva no encontrada"
                ));
    }

    @Transactional
    public Reserva actualizarEstado(
            String codigo,
            String nuevoEstado) {

        if (codigo == null || codigo.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El código de reserva es obligatorio"
            );
        }

        if (nuevoEstado == null || nuevoEstado.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El estado de la reserva es obligatorio"
            );
        }

        String estado = nuevoEstado.trim().toLowerCase(Locale.ROOT);

        if (!estado.equals("confirmada") && !estado.equals("rechazada")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Solo se permite confirmar o rechazar una reserva"
            );
        }

        Reserva reserva = reservaRepository
                .buscarPorCodigoParaActualizar(codigo.trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Reserva no encontrada"
                ));

        if (!"pendiente".equalsIgnoreCase(reserva.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Solo se pueden gestionar reservas pendientes"
            );
        }

        if ("confirmada".equals(estado)) {
            List<Reserva> conflictos =
                    reservaRepository.buscarReservasSuperpuestas(
                            reserva.getHabitacion().getId(),
                            reserva.getFechaEntrada(),
                            reserva.getFechaSalida()
                    );

            boolean conflictoReal = conflictos.stream()
                    .anyMatch(otra ->
                            !otra.getCodigo().equals(reserva.getCodigo())
                                    && !"rechazada".equalsIgnoreCase(otra.getEstado()));

            if (conflictoReal) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "La habitación ya tiene otra reserva para esas fechas"
                );
            }
        }

        reserva.setEstado(estado);
        return reservaRepository.save(reserva);
    }
}
