package com.epiis.Siball.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import com.epiis.Siball.repository.UsuarioRepository;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class TokenAuthenticationFilter extends OncePerRequestFilter {
    private final TokenService tokenService;
    private final UsuarioRepository usuarioRepository;

    public TokenAuthenticationFilter(TokenService tokenService, UsuarioRepository usuarioRepository) {
        this.tokenService = tokenService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authorization = request.getHeader("Authorization");
        if (authorization != null && authorization.startsWith("Bearer ")) {
            String token = authorization.substring(7).trim();
            var claims = tokenService.validar(token);
            if (claims.isEmpty()) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token inválido o expirado");
                return;
            }
            var c = claims.get();
            // Comprueba que la cuenta siga activa y que su rol no haya sido revocado.
            var usuario = usuarioRepository.findByCorreoIgnoreCaseAndActivoTrue(c.correo());
            if (usuario.isEmpty() || !c.rol().equalsIgnoreCase(usuario.get().getRol())) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "La cuenta no está activa o sus permisos cambiaron");
                return;
            }
            var authentication = new UsernamePasswordAuthenticationToken(
                    usuario.get().getCorreo(), null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + usuario.get().getRol())));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        filterChain.doFilter(request, response);
    }
}
