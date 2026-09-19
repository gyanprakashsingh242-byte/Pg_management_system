
package com.livingpeace.backend.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TenantResponse {
    private Long id;
    private String name;
    private String phone;
    private String emergencyContact;
    private boolean active;
    private String assignedRoomNumber;
}