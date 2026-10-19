package com.epiis.Siball.service;

import com.epiis.Siball.dto.PagoRequest;
import com.epiis.Siball.dto.PagoResponse;
import com.epiis.Siball.model.Comprobante;
import com.epiis.Siball.model.Pago;
import com.epiis.Siball.model.Reserva;
import com.epiis.Siball.repository.PagoRepository;
import com.epiis.Siball.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class PagoService {

    private final PagoRepository pagoRepository;
    private final ReservaRepository reservaRepository;
    private final ComprobanteService comprobanteService;

    public PagoService(
            PagoRepository pagoRepository,
            ReservaRepository reservaRepository,
            ComprobanteService comprobanteService) {
        this.pagoRepository = pagoRepository;
        this.reservaRepository = reservaRepository;
        this.comprobanteService = comprobanteService;
    }

    @Transactional
    public PagoResponse registrar(PagoRequest request) {

        Reserva reserva = reservaRepository
                .buscarPorCodigoParaActualizar(request.getCodigoReserva())
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        BigDecimal pagado = pagoRepository.calcularTotalPagado(reserva.getId());
        BigDecimal saldo = reserva.getTotal().subtract(pagado);

        if (request.getMonto().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor que cero");
        }

        if (request.getMonto().compareTo(saldo) > 0) {
            throw new IllegalArgumentException("El pago supera el saldo pendiente");
        }

        if (request.getReferencia() != null
                && !request.getReferencia().isBlank()
                && pagoRepository.existsByReferencia(request.getReferencia())) {
            throw new IllegalArgumentException("La referencia ya fue registrada");
        }

        Pago pago = new Pago();
        pago.setReserva(reserva);
        pago.setMonto(request.getMonto());
        pago.setMetodo(request.getMetodo());
        pago.setReferencia(
                request.getReferencia() == null || request.getReferencia().isBlank()
                        ? null : request.getReferencia());

        pago = pagoRepository.save(pago);

        Comprobante comprobante = comprobanteService.emitir(pago);

        BigDecimal nuevoSaldo = saldo.subtract(request.getMonto());

        reserva.setEstadoPago(
                nuevoSaldo.compareTo(BigDecimal.ZERO) == 0
                        ? "pagado" : "parcial");

        reservaRepository.save(reserva);

        return new PagoResponse(
                pago.getId(),
                comprobante.getNumero(),
                pago.getMonto(),
                nuevoSaldo,
                reserva.getEstadoPago());
    }
}