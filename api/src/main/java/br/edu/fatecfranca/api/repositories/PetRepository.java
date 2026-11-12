package br.edu.fatecfranca.api.repositories;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import br.edu.fatecfranca.api.models.Pet;

public interface PetRepository extends MongoRepository<Pet, String> {
    List<Pet> findByOwnerId(String ownerId);
    boolean existsByOwnerId(String ownerId);
}
