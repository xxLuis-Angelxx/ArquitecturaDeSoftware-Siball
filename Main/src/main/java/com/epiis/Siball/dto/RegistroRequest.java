package com.epiis.Siball.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegistroRequest {
    @NotBlank @Size(max = 20)
    private String tipoDocumento;
    @NotBlank @Size(max = 30)
    private String numeroDocumento;
    @NotBlank @Size(max = 100)
    private String nombres;
    @NotBlank @Size(max = 100)
    private String apellidos;
    @Size(max = 20)
    private String telefono;
    @NotBlank @Email @Size(max = 150)
    private String correo;
    @NotBlank @Size(min = 8, max = 72)
    private String password;

    public String getTipoDocumento() { return tipoDocumento; }
    public void setTipoDocumento(String tipoDocumento) { this.tipoDocumento = tipoDocumento; }
    public String getNumeroDocumento() { return numeroDocumento; }
    public void setNumeroDocumento(String numeroDocumento) { this.numeroDocumento = numeroDocumento; }
    public String getNombres() { return nombres; }
    public void setNombres(String nombres) { this.nombres = nombres; }
    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
