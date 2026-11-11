package br.edu.fatecfranca.api.models;

import java.time.LocalDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

@Document(collection = "passeios")
public class Passeio {
    
    @Id
    private String id;

    @NotBlank(message = "O ID do Walker é obrigatório.")
    private String walkerId;

    @NotBlank(message = "O ID do Pet é obrigatório.")
    private String petId;

    @NotNull(message = "A data do passeio é obrigatória.")
    private LocalDate data;

    @NotBlank(message = "O status é obrigatório.")
    @Pattern(regexp = "AGENDADO|REALIZADO|CANCELADO", message = "O status deve ser AGENDADO, REALIZADO ou CANCELADO.")
    private String status;

    public Passeio() {}

    public Passeio(String id, String walkerId, String petId, LocalDate data, String status) {
        this.id = id;
        this.walkerId = walkerId;
        this.petId = petId;
        this.data = data;
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    
}