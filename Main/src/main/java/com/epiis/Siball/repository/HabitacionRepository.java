package com.epiis.Siball.repository;

import com.epiis.Siball.model.Habitacion;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface HabitacionRepository
        extends JpaRepository<Habitacion, Integer> {

    Optional<Habitacion> findByNumero(String numero);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT h FROM Habitacion h WHERE h.id = :id")
    Optional<Habitacion> buscarParaActualizar(@Param("id") Integer id);
}