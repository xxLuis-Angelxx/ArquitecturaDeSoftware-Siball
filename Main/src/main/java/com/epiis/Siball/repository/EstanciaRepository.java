package com.epiis.Siball.repository;

import com.epiis.Siball.model.Estancia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EstanciaRepository extends JpaRepository<Estancia, Integer> {

    Optional<Estancia> findByReservaCodigo(String codigo);

    List<Estancia> findByEstado(String estado);
}