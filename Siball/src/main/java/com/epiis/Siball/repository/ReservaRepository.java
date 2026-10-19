package com.epiis.Siball.repository;

import com.epiis.Siball.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ReservaRepository extends JpaRepository<Reserva, Integer> {

    Optional<Reserva> findByCodigo(String codigo);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Reserva r WHERE r.codigo = :codigo")
    Optional<Reserva> buscarPorCodigoParaActualizar(
        @Param("codigo") String codigo
    );

    @Query("""
        SELECT r FROM Reserva r
        WHERE r.habitacion.id = :habitacionId
        AND r.estado IN ('confirmada', 'en_curso')
        AND r.fechaEntrada < :fechaSalida
        AND r.fechaSalida > :fechaEntrada
        """)
    List<Reserva> buscarReservasSuperpuestas(
        @Param("habitacionId") Integer habitacionId,
        @Param("fechaEntrada") LocalDate fechaEntrada,
        @Param("fechaSalida") LocalDate fechaSalida
    );
}