package com.livingpeace.backend.config;

import com.livingpeace.backend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 1. Allow all CORS preflight OPTIONS calls
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 2. Auth routes
                        .requestMatchers("/api/v1/auth/**").permitAll()

                        // 3. Room & Tenant View routes (Public/Unauthenticated Allowed)
                        .requestMatchers(HttpMethod.GET, "/api/v1/rooms", "/api/v1/rooms/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/tenants", "/api/v1/tenants/**").permitAll()

                        // 4. Caretaker & Admin updates
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/rooms/*/meter").hasAnyRole("ADMIN", "CARETAKER")

                        // 5. Admin-Only updates
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/rooms/*/toggle-status").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/rooms/*/rent").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/rooms/export/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/tenants/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/tenants/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/tenants/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/users/**").hasRole("ADMIN")

                        // 6. Catch-all
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setExposedHeaders(List.of("Content-Disposition"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}