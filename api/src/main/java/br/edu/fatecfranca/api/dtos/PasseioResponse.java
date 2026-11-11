package br.edu.fatecfranca.api.dtos;

import java.time.LocalDate;
import br.edu.fatecfranca.api.models.Pet;
import br.edu.fatecfranca.api.models.Walker;

public record PasseioResponse(
    String id,
    String walkerId,
    String petId,
    LocalDate data,
    String status,
    Walker walker,
    Pet pet
) {}