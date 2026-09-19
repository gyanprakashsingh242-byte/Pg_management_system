package com.livingpeace.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String roomNumber; // e.g. "101", "205", "318"

    @Column(nullable = false)
    private Integer floor; // 1, 2, or 3

    @Column(nullable = false)
    private BigDecimal baseRent;

    private Double previousMeter;

    private Double currentMeter;

    @Builder.Default
    private boolean isPaid = false;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "tenant_id", referencedColumnName = "id")
    private Tenant currentTenant;
}
