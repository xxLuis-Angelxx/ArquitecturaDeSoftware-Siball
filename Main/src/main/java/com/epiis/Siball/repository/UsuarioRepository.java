package com.epiis.Siball.repository;

import com.epiis.Siball.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByCorreoIgnoreCase(String correo);
    Optional<Usuario> findByCorreoIgnoreCaseAndActivoTrue(String correo);
    boolean existsByCorreoIgnoreCase(String correo);
}
