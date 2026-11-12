package br.edu.fatecfranca.api.models;

import java.util.List;
import java.util.Map;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.br.CPF;

/**
 * Perfil de dog walker (mesma forma do Walker do front: src/data/mock/walkers.js).
 * Campos de conta (e-mail/senha) convivem com o perfil profissional; `unlisted`
 * indica que o perfil ainda não está completo para aparecer na busca.
 */
@Document(collection = "walkers")
public class Walker {

    @Id
    private String id;

    @NotBlank(message = "O nome é obrigatório.")
    private String name;

    @Email(message = "O e-mail informado é inválido.")
    private String email;

    /** Senha em texto puro: aceita apenas na entrada, nunca é devolvida. */
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    /** Hash BCrypt: nunca sai da API nem entra por JSON. */
    @JsonIgnore
    private String passwordHash;

    /** Opcional: CPF do profissional, validado quando informado. */
    @CPF(message = "O CPF informado é inválido.")
    private String cpf;

    private String phone;
    private String avatar;

    /** Galeria de fotos; a primeira é a capa. */
    private List<String> photos;

    private String neighborhood;
    private String city;
    private Coords coords;

    private Double rating;
    private Integer reviewsCount;
    private Integer walksCount;
    private Integer yearsExperience;
    private Verification verification;

    private String headline;
    private String bio;
    private List<String> courses;

    /** Portes atendidos (ids de DOG_SIZES: mini, pequeno, medio, grande, gigante). */
    private List<String> sizes;

    private Boolean reactiveExperience;
    private Boolean acceptsMuzzle;
    private Boolean medicationExperience;
    private Boolean puppies;
    private Boolean seniors;

    /** Bairros atendidos. */
    private List<String> areas;

    /** Duração (min) → preço (BRL). */
    private Map<Integer, Double> prices;

    /** Dia da semana (0 = domingo … 6 = sábado) → horários oferecidos. */
    private Map<Integer, List<String>> availability;

    /** ISO date → horários bloqueados ("*" = dia inteiro de folga). */
    private Map<String, List<String>> blockedSlots;

    private Integer maxDogsPerWalk;
    private String responseTime;
    private String joinedAt;

    /** Fora da busca até completar bio e disponibilidade. */
    private Boolean unlisted;

    public record Verification(String identity, String background) {
    }

    public Walker() {
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

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
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

    public List<String> getPhotos() {
        return photos;
    }

    public void setPhotos(List<String> photos) {
        this.photos = photos;
    }

    public String getNeighborhood() {
        return neighborhood;
    }

    public void setNeighborhood(String neighborhood) {
        this.neighborhood = neighborhood;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public Coords getCoords() {
        return coords;
    }

    public void setCoords(Coords coords) {
        this.coords = coords;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getReviewsCount() {
        return reviewsCount;
    }

    public void setReviewsCount(Integer reviewsCount) {
        this.reviewsCount = reviewsCount;
    }

    public Integer getWalksCount() {
        return walksCount;
    }

    public void setWalksCount(Integer walksCount) {
        this.walksCount = walksCount;
    }

    public Integer getYearsExperience() {
        return yearsExperience;
    }

    public void setYearsExperience(Integer yearsExperience) {
        this.yearsExperience = yearsExperience;
    }

    public Verification getVerification() {
        return verification;
    }

    public void setVerification(Verification verification) {
        this.verification = verification;
    }

    public String getHeadline() {
        return headline;
    }

    public void setHeadline(String headline) {
        this.headline = headline;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public List<String> getCourses() {
        return courses;
    }

    public void setCourses(List<String> courses) {
        this.courses = courses;
    }

    public List<String> getSizes() {
        return sizes;
    }

    public void setSizes(List<String> sizes) {
        this.sizes = sizes;
    }

    public Boolean getReactiveExperience() {
        return reactiveExperience;
    }

    public void setReactiveExperience(Boolean reactiveExperience) {
        this.reactiveExperience = reactiveExperience;
    }

    public Boolean getAcceptsMuzzle() {
        return acceptsMuzzle;
    }

    public void setAcceptsMuzzle(Boolean acceptsMuzzle) {
        this.acceptsMuzzle = acceptsMuzzle;
    }

    public Boolean getMedicationExperience() {
        return medicationExperience;
    }

    public void setMedicationExperience(Boolean medicationExperience) {
        this.medicationExperience = medicationExperience;
    }

    public Boolean getPuppies() {
        return puppies;
    }

    public void setPuppies(Boolean puppies) {
        this.puppies = puppies;
    }

    public Boolean getSeniors() {
        return seniors;
    }

    public void setSeniors(Boolean seniors) {
        this.seniors = seniors;
    }

    public List<String> getAreas() {
        return areas;
    }

    public void setAreas(List<String> areas) {
        this.areas = areas;
    }

    public Map<Integer, Double> getPrices() {
        return prices;
    }

    public void setPrices(Map<Integer, Double> prices) {
        this.prices = prices;
    }

    public Map<Integer, List<String>> getAvailability() {
        return availability;
    }

    public void setAvailability(Map<Integer, List<String>> availability) {
        this.availability = availability;
    }

    public Map<String, List<String>> getBlockedSlots() {
        return blockedSlots;
    }

    public void setBlockedSlots(Map<String, List<String>> blockedSlots) {
        this.blockedSlots = blockedSlots;
    }

    public Integer getMaxDogsPerWalk() {
        return maxDogsPerWalk;
    }

    public void setMaxDogsPerWalk(Integer maxDogsPerWalk) {
        this.maxDogsPerWalk = maxDogsPerWalk;
    }

    public String getResponseTime() {
        return responseTime;
    }

    public void setResponseTime(String responseTime) {
        this.responseTime = responseTime;
    }

    public String getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(String joinedAt) {
        this.joinedAt = joinedAt;
    }

    public Boolean getUnlisted() {
        return unlisted;
    }

    public void setUnlisted(Boolean unlisted) {
        this.unlisted = unlisted;
    }
}
