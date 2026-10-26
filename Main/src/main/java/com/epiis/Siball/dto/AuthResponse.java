package com.epiis.Siball.dto;

public class AuthResponse {
    private String token;
    private String tipoToken = "Bearer";
    private long expiraEnSegundos;
    private UsuarioResponse usuario;

    public AuthResponse() {}
    public AuthResponse(String token, long expiraEnSegundos, UsuarioResponse usuario) {
        this.token = token; this.expiraEnSegundos = expiraEnSegundos; this.usuario = usuario;
    }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getTipoToken() { return tipoToken; }
    public void setTipoToken(String tipoToken) { this.tipoToken = tipoToken; }
    public long getExpiraEnSegundos() { return expiraEnSegundos; }
    public void setExpiraEnSegundos(long expiraEnSegundos) { this.expiraEnSegundos = expiraEnSegundos; }
    public UsuarioResponse getUsuario() { return usuario; }
    public void setUsuario(UsuarioResponse usuario) { this.usuario = usuario; }
}
