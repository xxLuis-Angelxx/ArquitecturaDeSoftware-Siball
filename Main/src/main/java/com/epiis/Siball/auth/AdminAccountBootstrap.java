package com.epiis.Siball.auth;

import com.epiis.Siball.model.Usuario;
import com.epiis.Siball.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AdminAccountBootstrap implements ApplicationRunner {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public AdminAccountBootstrap(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
                                 @Value("${siball.security.admin.email}") String adminEmail,
                                 @Value("${siball.security.admin.password}") String adminPassword) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail.trim().toLowerCase();
        this.adminPassword = adminPassword;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Usuario existente = usuarioRepository.findByCorreoIgnoreCase(adminEmail).orElse(null);
        if (existente != null) {
            if (!"ADMIN".equalsIgnoreCase(existente.getRol())) {
                throw new IllegalStateException("El correo configurado para administrador ya existe con rol distinto de ADMIN: " + adminEmail);
            }
            return; // no cambiar una contraseña ya administrada en la base de datos
        }
        if (adminPassword == null || adminPassword.length() < 8) {
            throw new IllegalStateException("La contraseña inicial de administrador debe tener al menos 8 caracteres");
        }
        Usuario admin = new Usuario();
        admin.setCorreo(adminEmail);
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setRol("ADMIN");
        admin.setActivo(true);
        usuarioRepository.save(admin);
    }
}
