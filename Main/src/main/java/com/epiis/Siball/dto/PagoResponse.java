package com.epiis.Siball.dto;

import java.math.BigDecimal;

public class PagoResponse {

    private Integer pagoId;
    private String comprobante;
    private BigDecimal monto;
    private BigDecimal saldoPendiente;
    private String estadoPago;

    public PagoResponse() {}

    public PagoResponse(Integer pagoId, String comprobante,
                        BigDecimal monto, BigDecimal saldoPendiente,
                        String estadoPago) {
        this.pagoId = pagoId;
        this.comprobante = comprobante;
        this.monto = monto;
        this.saldoPendiente = saldoPendiente;
        this.estadoPago = estadoPago;
    }

    public Integer getPagoId() { return pagoId; }
    public void setPagoId(Integer pagoId) { this.pagoId = pagoId; }

    public String getComprobante() { return comprobante; }
    public void setComprobante(String comprobante) { this.comprobante = comprobante; }

    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }

    public BigDecimal getSaldoPendiente() { return saldoPendiente; }
    public void setSaldoPendiente(BigDecimal saldoPendiente) { this.saldoPendiente = saldoPendiente; }

    public String getEstadoPago() { return estadoPago; }
    public void setEstadoPago(String estadoPago) { this.estadoPago = estadoPago; }
}