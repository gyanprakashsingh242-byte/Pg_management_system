package com.livingpeace.backend.dto;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;

@Getter
@Builder
public class RoomResponse {
    private Long id;
    private String roomNumber;
    private Integer floor;
    private BigDecimal baseRent;
    private Double previousMeter;
    private Double currentMeter;
    private boolean isPaid;
    private String tenantName;
    private String tenantPhone;
}