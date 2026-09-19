package com.livingpeace.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class UpdateRentRequest {
    @NotNull(message = "Rent amount is required")
    @Positive(message = "Rent must be greater than zero")
    private BigDecimal baseRent;
}
