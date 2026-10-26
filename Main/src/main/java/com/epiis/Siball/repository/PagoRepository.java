package com.epiis.Siball.repository;

import com.epiis.Siball.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface PagoRepository extends JpaRepository<Pago, Integer> {

    List<Pago> findByReservaCodigo(String codigo);

    boolean existsByReferencia(String referencia);
    
    @Query("""
        SELECT COALESCE(SUM(p.monto), 0)
        FROM Pago p
        WHERE p.reserva.id = :reservaId
        """)
    BigDecimal calcularTotalPagado(@Param("reservaId") Integer reservaId);
    
}