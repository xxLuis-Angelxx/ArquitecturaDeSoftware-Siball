package com.epiis.Siball.repository;

import com.epiis.Siball.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Integer> {

    Optional<Cliente> findByTipoDocumentoAndNumeroDocumento(
        String tipoDocumento,
        String numeroDocumento
    );
}