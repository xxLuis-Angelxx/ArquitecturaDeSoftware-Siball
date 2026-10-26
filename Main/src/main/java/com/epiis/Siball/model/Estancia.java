package com.epiis.Siball.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "estancias")
public class Estancia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "reserva_id", nullable = false, unique = true)
    private Reserva reserva;

    @Column(name = "fecha_checkin")
    private LocalDateTime fechaCheckin;

    @Column(name = "fecha_checkout")
    private LocalDateTime fechaCheckout;

    @Column(nullable = false, length = 30)
    private String estado = "en_curso";

    public Estancia() {
    }

    @PrePersist
    public void antesDeGuardar() {
        if (fechaCheckin == null) {
            fechaCheckin = LocalDateTime.now();
        }
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Reserva getReserva() { return reserva; }
    public void setReserva(Reserva reserva) { this.reserva = reserva; }

    public LocalDateTime getFechaCheckin() { return fechaCheckin; }
    public void setFechaCheckin(LocalDateTime fechaCheckin) { this.fechaCheckin = fechaCheckin; }

    public LocalDateTime getFechaCheckout() { return fechaCheckout; }
    public void setFechaCheckout(LocalDateTime fechaCheckout) { this.fechaCheckout = fechaCheckout; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}