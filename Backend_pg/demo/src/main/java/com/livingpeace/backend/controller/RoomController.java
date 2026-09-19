package com.livingpeace.backend.controller;

import com.livingpeace.backend.dto.RoomResponse;
import com.livingpeace.backend.dto.UpdateMeterRequest;
import com.livingpeace.backend.dto.UpdateRentRequest;
import com.livingpeace.backend.service.RoomService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // React Vite dev server
public class RoomController {

    private final RoomService roomService;

    // GET all rooms or filter by floor (e.g. /api/v1/rooms?floor=2)
    @GetMapping
    public ResponseEntity<List<RoomResponse>> getAllRooms(@RequestParam(required = false) Integer floor) {
        return ResponseEntity.ok(roomService.getAllRooms(floor));
    }

    // GET single room
    @GetMapping("/{roomNumber}")
    public ResponseEntity<RoomResponse> getRoom(@PathVariable String roomNumber) {
        return ResponseEntity.ok(roomService.getRoomByNumber(roomNumber));
    }

    // PATCH update meter reading
    @PatchMapping("/{roomNumber}/meter")
    public ResponseEntity<RoomResponse> updateMeter(
            @PathVariable String roomNumber,
            @Valid @RequestBody UpdateMeterRequest request) {
        return ResponseEntity.ok(roomService.updateMeterReading(roomNumber, request));
    }

    // PATCH toggle paid/pending status
    @PatchMapping("/{roomNumber}/toggle-status")
    public ResponseEntity<RoomResponse> toggleStatus(@PathVariable String roomNumber) {
        return ResponseEntity.ok(roomService.togglePaymentStatus(roomNumber));
    }
    @PatchMapping("/{roomNumber}/rent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoomResponse> updateRent(
            @PathVariable String roomNumber,
            @Valid @RequestBody UpdateRentRequest request) {
        return ResponseEntity.ok(roomService.updateRoomRent(roomNumber, request.getBaseRent()));
    }

    // EXPORT complete ledger to CSV/Excel
    @GetMapping("/export/excel")
    @PreAuthorize("hasRole('ADMIN')")
    public void exportToExcel(
            @RequestParam(defaultValue = "10.0") Double rate,
            HttpServletResponse response) throws IOException {

        response.setContentType("text/csv; charset=UTF-8");
        String fileName = "Living_Peace_Billing_" + System.currentTimeMillis() + ".csv";
        response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"");

        List<RoomResponse> rooms = roomService.getAllRooms(null);

        try (PrintWriter writer = response.getWriter()) {
            // UTF-8 BOM add kiya hai taaki Excel symbol aur text theek se encode kare
            writer.write('\ufeff');

            // CSV Columns Header
            writer.println("Room Number,Floor,Resident Name,Phone,Base Rent (INR),Prev Meter,Current Meter,Units Consumed,Power Rate (INR),Electricity Dues (INR),Total Payable (INR),Payment Status");

            // CSV Rows
            for (RoomResponse r : rooms) {
                double prev = r.getPreviousMeter() != null ? r.getPreviousMeter() : 0.0;
                double curr = r.getCurrentMeter() != null ? r.getCurrentMeter() : 0.0;
                double units = Math.max(0.0, curr - prev);
                double elecDues = units * rate;
                double baseRent = r.getBaseRent() != null ? r.getBaseRent().doubleValue() : 0.0;
                double total = baseRent + elecDues;
                String status = r.isPaid() ? "SETTLED" : "PENDING";

                writer.printf("%s,%d,\"%s\",\"%s\",%.2f,%.1f,%.1f,%.1f,%.2f,%.2f,%.2f,%s\n",
                        r.getRoomNumber(),
                        r.getFloor(),
                        r.getTenantName() != null ? r.getTenantName() : "Vacant",
                        r.getTenantPhone() != null ? r.getTenantPhone() : "N/A",
                        baseRent,
                        prev,
                        curr,
                        units,
                        rate,
                        elecDues,
                        total,
                        status
                );
            }
        }
    }
}