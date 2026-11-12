package br.edu.fatecfranca.api.models;

import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Conta de usuário do Rolê de Pet (mesma forma do User do front: src/data/mock/users.js).
 * Tanto contas de tutor quanto contas de dog walker moram aqui, diferenciadas por `roles`
 * e `walkerProfileId`.
 */
@Document(collection = "tutores")
public class Tutor {

    @Id
    private String id;

    @NotBlank(message = "O nome é obrigatório.")
    private String name;

    @NotBlank(message = "O e-mail é obrigatório.")
    @Email(message = "O e-mail informado é inválido.")
    private String email;

    /** Senha em texto puro: aceita apenas na entrada, nunca é devolvida. */
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    /** Hash BCrypt: nunca sai da API nem entra por JSON. */
    @JsonIgnore
    private String passwordHash;

    private String phone;
    private String avatar;

    /** 'owner' e/ou 'walker' */
    private List<String> roles;

    /** Perfil profissional próprio da conta (null para contas só de tutor). */
    private String walkerProfileId;

    /** Ids de walkers favoritos deste usuário. */
    private List<String> favorites;

    private Address address;
    private List<EmergencyContact> emergencyContacts;
    private Settings settings;
    private String createdAt;

    public record Address(String street, String neighborhood, String city, Coords coords, String notes) {
    }

    public record EmergencyContact(String name, String relation, String phone) {
    }

    public record Settings(boolean whatsappUpdates, boolean emailReceipts, boolean shareLiveByDefault) {
    }

    public Tutor() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public String getWalkerProfileId() {
        return walkerProfileId;
    }

    public void setWalkerProfileId(String walkerProfileId) {
        this.walkerProfileId = walkerProfileId;
    }

    public List<String> getFavorites() {
        return favorites;
    }

    public void setFavorites(List<String> favorites) {
        this.favorites = favorites;
    }

    public Address getAddress() {
        return address;
    }

    public void setAddress(Address address) {
        this.address = address;
    }

    public List<EmergencyContact> getEmergencyContacts() {
        return emergencyContacts;
    }

    public void setEmergencyContacts(List<EmergencyContact> emergencyContacts) {
        this.emergencyContacts = emergencyContacts;
    }

    public Settings getSettings() {
        return settings;
    }

    public void setSettings(Settings settings) {
        this.settings = settings;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
