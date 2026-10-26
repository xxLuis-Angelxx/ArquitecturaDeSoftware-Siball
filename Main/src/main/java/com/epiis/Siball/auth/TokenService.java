package com.epiis.Siball.auth;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class TokenService {
    private static final String ALGORITHM = "HmacSHA256";
    private static final String HEADER = Base64.getUrlEncoder().withoutPadding()
            .encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));

    private final byte[] secret;
    private final long ttlSeconds;
    private final ObjectMapper objectMapper;

    public TokenService(
            @Value("${siball.security.jwt-secret}") String secret,
            @Value("${siball.security.token-ttl-seconds:14400}") long ttlSeconds,
            ObjectMapper objectMapper) {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException("SIBALL_JWT_SECRET debe tener al menos 32 bytes");
        }
        if (ttlSeconds < 300) {
            throw new IllegalArgumentException("El tiempo de vida del token debe ser de al menos 300 segundos");
        }
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.ttlSeconds = ttlSeconds;
        this.objectMapper = objectMapper;
    }

    public String crearToken(String correo, String rol) {
        try {
            Map<String, Object> claims = new HashMap<>();
            claims.put("sub", correo);
            claims.put("role", rol);
            claims.put("exp", Instant.now().getEpochSecond() + ttlSeconds);
            String payload = Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(objectMapper.writeValueAsBytes(claims));
            String unsigned = HEADER + "." + payload;
            return unsigned + "." + firmar(unsigned);
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo generar el token de acceso", e);
        }
    }

    public Optional<TokenClaims> validar(String token) {
        try {
            String[] partes = token.split("\\.", -1);
            if (partes.length != 3 || !HEADER.equals(partes[0])) return Optional.empty();
            String unsigned = partes[0] + "." + partes[1];
            byte[] firmaRecibida = Base64.getUrlDecoder().decode(partes[2]);
            byte[] firmaEsperada = Base64.getUrlDecoder().decode(firmar(unsigned));
            if (!MessageDigest.isEqual(firmaRecibida, firmaEsperada)) return Optional.empty();

            byte[] json = Base64.getUrlDecoder().decode(partes[1]);
            JsonNode claims = objectMapper.readTree(json);
            String correo = claims.path("sub").asText("");
            String rol = claims.path("role").asText("");
            long exp = claims.path("exp").asLong(0);
            if (correo.isBlank() || !("USER".equals(rol) || "ADMIN".equals(rol))
                    || exp <= Instant.now().getEpochSecond()) return Optional.empty();
            return Optional.of(new TokenClaims(correo, rol, exp));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public long getTtlSeconds() { return ttlSeconds; }

    private String firmar(String texto) throws Exception {
        Mac mac = Mac.getInstance(ALGORITHM);
        mac.init(new SecretKeySpec(secret, ALGORITHM));
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(mac.doFinal(texto.getBytes(StandardCharsets.UTF_8)));
    }

    public record TokenClaims(String correo, String rol, long exp) {}
}
