package com.epiis.Siball.service;

import com.epiis.Siball.model.Comprobante;
import com.epiis.Siball.model.Pago;
import com.epiis.Siball.repository.ComprobanteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class ComprobanteService {

    private final ComprobanteRepository comprobanteRepository;

    public ComprobanteService(ComprobanteRepository comprobanteRepository) {
        this.comprobanteRepository = comprobanteRepository;
    }

    @Transactional
    public Comprobante emitir(Pago pago) {
        Comprobante comprobante = new Comprobante();
        comprobante.setPago(pago);
        comprobante.setNumero("CP-" + pago.getId());
        comprobante.setMonto(pago.getMonto());

        return comprobanteRepository.save(comprobante);
    }

    public BigDecimal obtenerMonto(Integer comprobanteId) {
        return comprobanteRepository.findById(comprobanteId)
                .map(Comprobante::getMonto)
                .orElseThrow(() -> new RuntimeException("Comprobante no encontrado"));
    }
}