package com.epiis.Siball.dto;

import jakarta.validation.constraints.NotBlank;

public class CheckinRequest {

    @NotBlank
    private String codigoReserva;

    public CheckinRequest() {}

    public String getCodigoReserva() { return codigoReserva; }
    public void setCodigoReserva(String codigoReserva) { this.codigoReserva = codigoReserva; }
}