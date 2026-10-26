
package com.epiis.Siball.controller;

import com.epiis.Siball.dto.ReservaRequest;
import com.epiis.Siball.dto.ReservaResponse;
import com.epiis.Siball.model.Reserva;
import com.epiis.Siball.service.ReservaService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "http://localhost:4200")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservaResponse crear(
            @Valid @RequestBody ReservaRequest request,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Debes iniciar sesión para reservar"
            );
        }

        return reservaService.crear(request, authentication.getName());
    }

    @GetMapping
    public List<Reserva> listarTodas() {
        return reservaService.listarTodas();
    }

    @GetMapping("/mias")
    public List<Reserva> listarMias(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Debes iniciar sesión para consultar tus reservas"
            );
        }

        return reservaService.listarMias(authentication.getName());
    }

    @GetMapping("/{codigo}")
    public Reserva buscarPorCodigo(@PathVariable String codigo) {
        return reservaService.buscarPorCodigo(codigo);
    }

    @PatchMapping("/{codigo}/estado")
    public Reserva actualizarEstado(
            @PathVariable String codigo,
            @RequestBody Map<String, String> solicitud) {

        if (solicitud == null || solicitud.get("estado") == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debes indicar el nuevo estado"
            );
        }

        return reservaService.actualizarEstado(
                codigo,
                solicitud.get("estado")
        );
    }
}
