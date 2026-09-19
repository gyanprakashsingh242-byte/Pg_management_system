package com.livingpeace.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateMeterRequest {

    @NotNull(message = "Current meter reading is required")
    @PositiveOrZero(message = "Reading cannot be negative")
    private Double currentMeter;
}
