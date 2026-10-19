package com.epiis.Siball.controller;

import com.epiis.Siball.dto.ReservaRequest;
import com.epiis.Siball.dto.ReservaResponse;
import com.epiis.Siball.model.Reserva;
import com.epiis.Siball.service.ReservaService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "http://localhost:4200")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @PostMapping
    public ReservaResponse crear(@Valid @RequestBody ReservaRequest request) {
        return reservaService.crear(request);
    }

    @GetMapping("/{codigo}")
    public Reserva buscarPorCodigo(@PathVariable String codigo) {
        return reservaService.buscarPorCodigo(codigo);
    }
}