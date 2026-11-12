package br.edu.fatecfranca.api.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.NotBlank;

/**
 * Pet (mesma forma do Pet do front: src/data/mock/pets.js), com o perfil de
 * segurança completo usado pela tela de análise do dog walker.
 */
@Document(collection = "pets")
public class Pet {

    @Id
    private String id;

    /** Dono do pet (id de Tutor). O front usa `ownerId`, não `tutorId`. */
    @NotBlank(message = "O ID do tutor é obrigatório.")
    private String ownerId;

    @NotBlank(message = "O nome é obrigatório.")
    private String name;

    private String photo;
    private String breed;
    private Integer ageYears;

    /** 'macho' | 'femea' */
    private String sex;

    private Double weightKg;

    /** Id de DOG_SIZES: mini, pequeno, medio, grande, gigante. */
    private String size;

    private String temperament;
    private String personality;
    private String triggers;

    /** Id de REACTIVITY_LEVELS: nenhuma, leve, moderada, alta. */
    private String reactivity;

    /** Id de DOG_SOCIABILITY: sociavel, seletivo, evitar. */
    private String dogInteraction;

    private String behaviorNotes;
    private Equipment equipment;
    private Health health;

    /** Informação crítica de segurança, curta e visível. */
    private String safetyAlert;
    private Emergency emergency;

    public record Equipment(String muzzle, String harness, String collar) {
    }

    public record Health(
            String conditions,
            String medication,
            String dosage,
            String medicationTimes,
            String effortRestrictions,
            Integer maxWalkMinutes,
            String vaccination) {
    }

    public record Emergency(
            String ownerPhone,
            String emergencyName,
            String emergencyPhone,
            String vetName,
            String vetPhone) {
    }

    public Pet() {
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhoto() {
        return photo;
    }

    public void setPhoto(String photo) {
        this.photo = photo;
    }

    public String getBreed() {
        return breed;
    }

    public void setBreed(String breed) {
        this.breed = breed;
    }

    public Integer getAgeYears() {
        return ageYears;
    }

    public void setAgeYears(Integer ageYears) {
        this.ageYears = ageYears;
    }

    public String getSex() {
        return sex;
    }

    public void setSex(String sex) {
        this.sex = sex;
    }

    public Double getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(Double weightKg) {
        this.weightKg = weightKg;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getTemperament() {
        return temperament;
    }

    public void setTemperament(String temperament) {
        this.temperament = temperament;
    }

    public String getPersonality() {
        return personality;
    }

    public void setPersonality(String personality) {
        this.personality = personality;
    }

    public String getTriggers() {
        return triggers;
    }

    public void setTriggers(String triggers) {
        this.triggers = triggers;
    }

    public String getReactivity() {
        return reactivity;
    }

    public void setReactivity(String reactivity) {
        this.reactivity = reactivity;
    }

    public String getDogInteraction() {
        return dogInteraction;
    }

    public void setDogInteraction(String dogInteraction) {
        this.dogInteraction = dogInteraction;
    }

    public String getBehaviorNotes() {
        return behaviorNotes;
    }

    public void setBehaviorNotes(String behaviorNotes) {
        this.behaviorNotes = behaviorNotes;
    }

    public Equipment getEquipment() {
        return equipment;
    }

    public void setEquipment(Equipment equipment) {
        this.equipment = equipment;
    }

    public Health getHealth() {
        return health;
    }

    public void setHealth(Health health) {
        this.health = health;
    }

    public String getSafetyAlert() {
        return safetyAlert;
    }

    public void setSafetyAlert(String safetyAlert) {
        this.safetyAlert = safetyAlert;
    }

    public Emergency getEmergency() {
        return emergency;
    }

    public void setEmergency(Emergency emergency) {
        this.emergency = emergency;
    }
}
