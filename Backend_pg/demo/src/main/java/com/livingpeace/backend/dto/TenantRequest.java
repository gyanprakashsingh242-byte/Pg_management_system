
package com.livingpeace.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TenantRequest {

    @NotBlank(message = "Tenant name is required")
    private String name;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10,13}$", message = "Phone must be 10 to 13 digits")
    private String phone;

    private String emergencyContact;

    // Optional: Assign directly to a room upon creation/update
    private String roomNumber;
}
