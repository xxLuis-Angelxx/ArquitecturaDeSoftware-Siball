package com.epiis.Siball.dto;

import java.math.BigDecimal;

public class ReservaResponse {

    private String codigo;
    private String estado;
    private BigDecimal total;

    public ReservaResponse() {}

    public ReservaResponse(String codigo, String estado, BigDecimal total) {
        this.codigo = codigo;
        this.estado = estado;
        this.total = total;
    }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
}