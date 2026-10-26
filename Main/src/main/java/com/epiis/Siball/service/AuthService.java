package com.epiis.Siball.service;

import com.epiis.Siball.auth.TokenService;
import com.epiis.Siball.dto.AuthResponse;
import com.epiis.Siball.dto.LoginRequest;
import com.epiis.Siball.dto.RegistroRequest;
import com.epiis.Siball.dto.UsuarioResponse;
import com.epiis.Siball.model.Cliente;
import com.epiis.Siball.model.Usuario;
import com.epiis.Siball.repository.ClienteRepository;
import com.epiis.Siball.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public AuthService(UsuarioRepository usuarioRepository, ClienteRepository clienteRepository,
                       PasswordEncoder passwordEncoder, TokenService tokenService) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    @Transactional
    public AuthResponse registrar(RegistroRequest request) {
        String correo = normalizarCorreo(request.getCorreo());
        if (usuarioRepository.existsByCorreoIgnoreCase(correo)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una cuenta con ese correo");
        }

        Cliente cliente = clienteRepository.findByTipoDocumentoAndNumeroDocumento(
                request.getTipoDocumento().trim(), request.getNumeroDocumento().trim()).orElse(null);
        if (cliente != null) {
            String correoExistente = cliente.getCorreo();
            // Solo se vincula un cliente precargado si el correo coincide: evita apropiarse
            // de reservas históricas indicando el documento de otra persona.
            if (correoExistente == null || !correo.equalsIgnoreCase(correoExistente.trim())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Los datos del documento ya existen. Contacta con recepción para vincular tu cuenta.");
            }
        } else {
            cliente = new Cliente();
            cliente.setTipoDocumento(request.getTipoDocumento().trim());
            cliente.setNumeroDocumento(request.getNumeroDocumento().trim());
        }
        cliente.setNombres(request.getNombres().trim());
        cliente.setApellidos(request.getApellidos().trim());
        cliente.setTelefono(limpiarOpcional(request.getTelefono()));
        cliente.setCorreo(correo);
        cliente = clienteRepository.save(cliente);

        Usuario usuario = new Usuario();
        usuario.setCliente(cliente);
        usuario.setCorreo(correo);
        usuario.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        usuario.setRol("USER"); // el rol nunca se toma del cuerpo enviado por el cliente
        usuario.setActivo(true);
        usuario = usuarioRepository.save(usuario);
        return generarRespuesta(usuario);
    }

    @Transactional(readOnly = true)
    public AuthResponse iniciarSesion(LoginRequest request) {
        String correo = normalizarCorreo(request.getCorreo());
        Usuario usuario = usuarioRepository.findByCorreoIgnoreCaseAndActivoTrue(correo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos"));
        if (!passwordEncoder.matches(request.getPassword(), usuario.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos");
        }
        return generarRespuesta(usuario);
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtenerUsuarioActual(String correo) {
        Usuario usuario = usuarioRepository.findByCorreoIgnoreCaseAndActivoTrue(normalizarCorreo(correo))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "La cuenta no está activa"));
        return mapearUsuario(usuario);
    }

    private AuthResponse generarRespuesta(Usuario usuario) {
        return new AuthResponse(tokenService.crearToken(usuario.getCorreo(), usuario.getRol()),
                tokenService.getTtlSeconds(), mapearUsuario(usuario));
    }

    private UsuarioResponse mapearUsuario(Usuario usuario) {
        Cliente cliente = usuario.getCliente();
        return new UsuarioResponse(usuario.getId(), usuario.getCorreo(), usuario.getRol(),
                cliente == null ? null : cliente.getNombres(),
                cliente == null ? null : cliente.getApellidos());
    }

    private String normalizarCorreo(String correo) {
        if (correo == null) return "";
        return correo.trim().toLowerCase();
    }

    private String limpiarOpcional(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }
}
