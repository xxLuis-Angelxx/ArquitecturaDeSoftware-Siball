package com.epiis.Siball.controller;

import com.epiis.Siball.model.Comprobante;
import com.epiis.Siball.repository.ComprobanteRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comprobantes")
@CrossOrigin(origins = "http://localhost:4200")
public class ComprobanteController {

    private final ComprobanteRepository comprobanteRepository;

    public ComprobanteController(ComprobanteRepository comprobanteRepository) {
        this.comprobanteRepository = comprobanteRepository;
    }

    @GetMapping
    public List<Comprobante> listar() {
        return comprobanteRepository.findAll();
    }

    @GetMapping("/{id}")
    public Comprobante buscarPorId(@PathVariable Integer id) {
        return comprobanteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comprobante no encontrado"));
    }
}