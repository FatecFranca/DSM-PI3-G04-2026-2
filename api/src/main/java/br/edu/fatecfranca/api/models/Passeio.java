package br.edu.fatecfranca.api.models;

import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.NotBlank;

/**
 * Passeio/contratação (mesma forma do Booking do front: src/data/mock/bookings.js).
 * Datas e horários ficam como strings ("2026-11-11", "HH:MM") exatamente como o
 * front produz/consume. A máquina de transições por ator entra na Fase 4.
 */
@Document(collection = "passeios")
public class Passeio {

    @Id
    private String id;

    @NotBlank(message = "O ID do tutor é obrigatório.")
    private String ownerId;

    @NotBlank(message = "O ID do Walker é obrigatório.")
    private String walkerId;

    @NotBlank(message = "O ID do Pet é obrigatório.")
    private String petId;

    @NotBlank(message = "A data do passeio é obrigatória.")
    private String date;

    @NotBlank(message = "O horário do passeio é obrigatório.")
    private String time;

    /** Duração em minutos. */
    private Integer duration;

    /** Preço pago pelo tutor (BRL). */
    private Double price;

    /** Taxa da plataforma retida do walker. */
    private Double fee;

    /** price − fee. */
    private Double walkerEarnings;

    /** Um dos valores de {@link BookingStatus}. */
    @NotBlank(message = "O status é obrigatório.")
    private String status;

    private List<HistoryEntry> history;

    /** Código de 4 dígitos exibido ao tutor para confirmar a retirada. */
    private String pickupCode;

    private Payment payment;
    private Tracking tracking;
    private Review review;
    private String notes;
    private String address;
    private Long createdAt;
    private Long updatedAt;

    /** Solicitação/aceite expira quando chega o horário do passeio sem confirmação. */
    private Long expiresAt;

    public record HistoryEntry(String status, long at, String actor) {
    }

    public record Payment(String status, String methodId, Long paidAt, Long firstReleaseAt, Long releasedAt, Long refundedAt) {
    }

    public record Tracking(
            double approachProgress,
            double walkProgress,
            double distanceKm,
            int elapsedMin,
            Long startedAt,
            Long endedAt,
            String routeSummary) {
    }

    public record Review(int rating, String comment, long at) {
    }

    public Passeio() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }

    public String getWalkerId() {
        return walkerId;
    }

    public void setWalkerId(String walkerId) {
        this.walkerId = walkerId;
    }

    public String getPetId() {
        return petId;
    }

    public void setPetId(String petId) {
        this.petId = petId;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Double getFee() {
        return fee;
    }

    public void setFee(Double fee) {
        this.fee = fee;
    }

    public Double getWalkerEarnings() {
        return walkerEarnings;
    }

    public void setWalkerEarnings(Double walkerEarnings) {
        this.walkerEarnings = walkerEarnings;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<HistoryEntry> getHistory() {
        return history;
    }

    public void setHistory(List<HistoryEntry> history) {
        this.history = history;
    }

    public String getPickupCode() {
        return pickupCode;
    }

    public void setPickupCode(String pickupCode) {
        this.pickupCode = pickupCode;
    }

    public Payment getPayment() {
        return payment;
    }

    public void setPayment(Payment payment) {
        this.payment = payment;
    }

    public Tracking getTracking() {
        return tracking;
    }

    public void setTracking(Tracking tracking) {
        this.tracking = tracking;
    }

    public Review getReview() {
        return review;
    }

    public void setReview(Review review) {
        this.review = review;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Long createdAt) {
        this.createdAt = createdAt;
    }

    public Long getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Long updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Long expiresAt) {
        this.expiresAt = expiresAt;
    }
}
