package com.epiis.Siball.controller;

import com.epiis.Siball.dto.AuthResponse;
import com.epiis.Siball.dto.LoginRequest;
import com.epiis.Siball.dto.RegistroRequest;
import com.epiis.Siball.dto.UsuarioResponse;
import com.epiis.Siball.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/registro")
    public AuthResponse registrar(@Valid @RequestBody RegistroRequest request) {
        return authService.registrar(request);
    }

    @PostMapping("/login")
    public AuthResponse iniciarSesion(@Valid @RequestBody LoginRequest request) {
        return authService.iniciarSesion(request);
    }

    @GetMapping("/me")
    public UsuarioResponse usuarioActual(Authentication authentication) {
        return authService.obtenerUsuarioActual(authentication.getName());
    }
}
