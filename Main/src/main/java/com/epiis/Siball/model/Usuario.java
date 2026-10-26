package com.epiis.Siball.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente_id", unique = true)
    private Cliente cliente;

    @Column(nullable = false, unique = true, length = 150)
    private String correo;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(nullable = false, length = 20)
    private String rol = "USER";

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    public Usuario() {}

    @PrePersist
    public void antesDeGuardar() {
        if (fechaCreacion == null) fechaCreacion = LocalDateTime.now();
        if (correo != null) correo = correo.trim().toLowerCase();
        if (rol != null) rol = rol.trim().toUpperCase();
        if (activo == null) activo = true;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo == null ? null : correo.trim().toLowerCase(); }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol == null ? null : rol.trim().toUpperCase(); }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}
