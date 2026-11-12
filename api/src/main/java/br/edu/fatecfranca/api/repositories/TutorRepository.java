package br.edu.fatecfranca.api.repositories;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import br.edu.fatecfranca.api.models.Tutor;

public interface TutorRepository extends MongoRepository<Tutor, String> {
    Optional<Tutor> findByEmail(String email);
}
