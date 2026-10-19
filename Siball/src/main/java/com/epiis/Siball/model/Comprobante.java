package com.epiis.Siball.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "comprobantes")
public class Comprobante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "pago_id", nullable = false, unique = true)
    private Pago pago;

    @Column(nullable = false, unique = true, length = 20)
    private String numero;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @Column(name = "fecha_emision")
    private LocalDateTime fechaEmision;

    public Comprobante() {
    }

    @PrePersist
    public void antesDeGuardar() {
        if (fechaEmision == null) {
            fechaEmision = LocalDateTime.now();
        }
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Pago getPago() { return pago; }
    public void setPago(Pago pago) { this.pago = pago; }

    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }

    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }

    public LocalDateTime getFechaEmision() { return fechaEmision; }
    public void setFechaEmision(LocalDateTime fechaEmision) { this.fechaEmision = fechaEmision; }
}