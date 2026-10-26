package com.epiis.Siball.dto;

public class UsuarioResponse {
    private Integer id;
    private String correo;
    private String rol;
    private String nombres;
    private String apellidos;

    public UsuarioResponse() {}
    public UsuarioResponse(Integer id, String correo, String rol, String nombres, String apellidos) {
        this.id = id; this.correo = correo; this.rol = rol;
        this.nombres = nombres; this.apellidos = apellidos;
    }
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
    public String getNombres() { return nombres; }
    public void setNombres(String nombres) { this.nombres = nombres; }
    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }
}
