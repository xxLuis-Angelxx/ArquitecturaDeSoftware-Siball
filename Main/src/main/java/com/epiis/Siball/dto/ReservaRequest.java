package com.epiis.Siball.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class ReservaRequest {

    // Datos de identidad conservados por compatibilidad con el cliente anterior.
    // La identidad real de la reserva se toma de la cuenta autenticada.
    private String tipoDocumento;
    private String numeroDocumento;
    private String nombres;
    private String apellidos;

    private String telefono;

    private String correo;

    @NotNull
    private Integer habitacionId;

    @NotNull
    @Min(1)
    private Integer cantidadHuespedes;

    @NotNull
    @FutureOrPresent
    private LocalDate fechaEntrada;

    @NotNull
    @Future
    private LocalDate fechaSalida;

    public ReservaRequest() {
    }

    public String getTipoDocumento() {
        return tipoDocumento;
    }

    public void setTipoDocumento(String tipoDocumento) {
        this.tipoDocumento = tipoDocumento;
    }

    public String getNumeroDocumento() {
        return numeroDocumento;
    }

    public void setNumeroDocumento(String numeroDocumento) {
        this.numeroDocumento = numeroDocumento;
    }

    public String getNombres() {
        return nombres;
    }

    public void setNombres(String nombres) {
        this.nombres = nombres;
    }

    public String getApellidos() {
        return apellidos;
    }

    public void setApellidos(String apellidos) {
        this.apellidos = apellidos;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public Integer getHabitacionId() {
        return habitacionId;
    }

    public void setHabitacionId(Integer habitacionId) {
        this.habitacionId = habitacionId;
    }

    public Integer getCantidadHuespedes() {
        return cantidadHuespedes;
    }

    public void setCantidadHuespedes(Integer cantidadHuespedes) {
        this.cantidadHuespedes = cantidadHuespedes;
    }

    public LocalDate getFechaEntrada() {
        return fechaEntrada;
    }

    public void setFechaEntrada(LocalDate fechaEntrada) {
        this.fechaEntrada = fechaEntrada;
    }

    public LocalDate getFechaSalida() {
        return fechaSalida;
    }

    public void setFechaSalida(LocalDate fechaSalida) {
        this.fechaSalida = fechaSalida;
    }
}