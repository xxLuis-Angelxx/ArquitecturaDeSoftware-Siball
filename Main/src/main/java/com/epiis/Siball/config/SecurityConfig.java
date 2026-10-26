
package com.epiis.Siball.config;

import com.epiis.Siball.auth.TokenAuthenticationFilter;
import com.epiis.Siball.repository.UsuarioRepository;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public UserDetailsService userDetailsService(
            UsuarioRepository usuarioRepository) {

        return correo -> usuarioRepository
                .findByCorreoIgnoreCaseAndActivoTrue(correo)
                .map(usuario -> User.withUsername(usuario.getCorreo())
                        .password(usuario.getPasswordHash())
                        .roles(usuario.getRol())
                        .build())
                .orElseThrow(() ->
                        new UsernameNotFoundException("Cuenta no encontrada"));
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            TokenAuthenticationFilter tokenFilter) throws Exception {

        http
            .cors(Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)

            .sessionManagement(session ->
                    session.sessionCreationPolicy(
                            SessionCreationPolicy.STATELESS))

            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)

            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, exception) ->
                    response.sendError(
                            HttpServletResponse.SC_UNAUTHORIZED,
                            "Autenticación requerida"))

                .accessDeniedHandler((request, response, exception) ->
                    response.sendError(
                            HttpServletResponse.SC_FORBIDDEN,
                            "No tienes permisos para esta operación"))
            )

            .authorizeHttpRequests(auth -> auth

                // Permitir solicitudes CORS de preflight.
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Autenticación.
                .requestMatchers(
                        "/api/auth/registro",
                        "/api/auth/login"
                ).permitAll()

                .requestMatchers("/api/auth/me").authenticated()
                .requestMatchers("/api/auth/**").denyAll()

                // Habitaciones: consulta pública.
                .requestMatchers(
                        HttpMethod.GET,
                        "/api/habitaciones",
                        "/api/habitaciones/**"
                ).permitAll()

                // Reservas: permisos específicos antes de las reglas generales.
                .requestMatchers(
                        HttpMethod.GET,
                        "/api/reservas/mias"
                ).hasRole("USER")

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/reservas"
                ).hasRole("ADMIN")

                // Solo el administrador puede confirmar o rechazar reservas.
                .requestMatchers(
                        HttpMethod.PATCH,
                        "/api/reservas/*/estado"
                ).hasRole("ADMIN")

                // Crear una reserva requiere una cuenta de huésped.
                .requestMatchers(
                        HttpMethod.POST,
                        "/api/reservas"
                ).hasRole("USER")

                // Consulta individual de reservas: usuario o administrador.
                .requestMatchers(
                        HttpMethod.GET,
                        "/api/reservas/*"
                ).hasAnyRole("USER", "ADMIN")

                // Otras operaciones de reservas requieren autenticación.
                .requestMatchers(
                        "/api/reservas/**"
                ).hasAnyRole("USER", "ADMIN")

                // Administración de habitaciones.
                .requestMatchers(
                        HttpMethod.POST,
                        "/api/habitaciones"
                ).hasRole("ADMIN")

                .requestMatchers(
                        "/api/habitaciones",
                        "/api/habitaciones/**"
                ).hasRole("ADMIN")

                // Operaciones administrativas.
                .requestMatchers(
                        "/api/pagos",
                        "/api/pagos/**",
                        "/api/estancias",
                        "/api/estancias/**",
                        "/api/comprobantes",
                        "/api/comprobantes/**"
                ).hasRole("ADMIN")

                // Cualquier otra ruta requiere autenticación.
                .anyRequest().authenticated()
            )

            .addFilterBefore(
                    tokenFilter,
                    UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public FilterRegistrationBean<TokenAuthenticationFilter>
            disableContainerRegistration(
                    TokenAuthenticationFilter filter) {

        FilterRegistrationBean<TokenAuthenticationFilter> registration =
                new FilterRegistrationBean<>(filter);

        // El filtro se ejecuta únicamente dentro de Spring Security.
        registration.setEnabled(false);

        return registration;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of("http://localhost:4200")
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type",
                        "Accept"
                )
        );

        configuration.setExposedHeaders(
                List.of("Authorization")
        );

        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/api/**",
                configuration
        );

        return source;
    }
}
