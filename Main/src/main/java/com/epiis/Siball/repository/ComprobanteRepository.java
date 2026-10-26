package com.epiis.Siball.repository;

import com.epiis.Siball.model.Comprobante;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ComprobanteRepository
        extends JpaRepository<Comprobante, Integer> {

    Optional<Comprobante> findByNumero(String numero);
}