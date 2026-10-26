package com.epiis.Siball.controller;

import com.epiis.Siball.dto.CheckinRequest;
import com.epiis.Siball.model.Estancia;
import com.epiis.Siball.service.EstanciaService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/estancias")
@CrossOrigin(origins = "http://localhost:4200")
public class EstanciaController {

    private final EstanciaService estanciaService;

    public EstanciaController(EstanciaService estanciaService) {
        this.estanciaService = estanciaService;
    }

    @PostMapping("/checkin")
    public Estancia checkin(@Valid @RequestBody CheckinRequest request) {
        return estanciaService.registrarCheckin(request.getCodigoReserva());
    }

    @GetMapping
    public List<Estancia> listarEnCurso(
            @RequestParam(required = false) String estado) {
        if (estado == null || estado.isBlank()) {
            return estanciaService.listarEnCurso();
        }
        return estanciaService.listarEnCurso().stream()
                .filter(e -> estado.equalsIgnoreCase(e.getEstado()))
                .toList();
    }

    @PostMapping("/{id}/checkout")
    public Estancia checkout(@PathVariable Integer id) {
        return estanciaService.registrarCheckout(id);
    }
}