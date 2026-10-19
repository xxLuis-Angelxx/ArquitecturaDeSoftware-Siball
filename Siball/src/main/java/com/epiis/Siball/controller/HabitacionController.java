package com.epiis.Siball.controller;

import com.epiis.Siball.model.Habitacion;
import com.epiis.Siball.service.HabitacionService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/habitaciones")
@CrossOrigin(origins = "http://localhost:4200")
public class HabitacionController {

    private final HabitacionService habitacionService;

    public HabitacionController(HabitacionService habitacionService) {
        this.habitacionService = habitacionService;
    }

    @GetMapping
    public List<Habitacion> listar() {
        return habitacionService.listar();
    }

    @GetMapping("/{id}")
    public Habitacion buscarPorId(@PathVariable Integer id) {
        return habitacionService.buscarPorId(id);
    }

    @GetMapping("/disponibles")
    public List<Habitacion> disponibles(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fechaEntrada,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fechaSalida) {

        return habitacionService.disponibles(fechaEntrada, fechaSalida);
    }

    @PostMapping
    public Habitacion guardar(@RequestBody Habitacion habitacion) {
        return habitacionService.guardar(habitacion);
    }

    @PatchMapping("/{id}/limpieza")
    public Habitacion marcarDisponible(@PathVariable Integer id) {
        return habitacionService.marcarDisponible(id);
    }
}