package com.epiis.Siball.controller;

import com.epiis.Siball.dto.PagoRequest;
import com.epiis.Siball.dto.PagoResponse;
import com.epiis.Siball.model.Pago;
import com.epiis.Siball.repository.PagoRepository;
import com.epiis.Siball.service.PagoService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pagos")
@CrossOrigin(origins = "http://localhost:4200")
public class PagoController {

    private final PagoService pagoService;
    private final PagoRepository pagoRepository;

    public PagoController(PagoService pagoService, PagoRepository pagoRepository) {
        this.pagoService = pagoService;
        this.pagoRepository = pagoRepository;
    }

    @PostMapping
    public PagoResponse registrar(@Valid @RequestBody PagoRequest request) {
        return pagoService.registrar(request);
    }

    @GetMapping("/reserva/{codigo}")
    public List<Pago> listarPorReserva(@PathVariable String codigo) {
        return pagoRepository.findByReservaCodigo(codigo);
    }
}