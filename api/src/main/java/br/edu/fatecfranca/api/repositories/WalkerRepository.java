package br.edu.fatecfranca.api.repositories;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import br.edu.fatecfranca.api.models.Walker;

public interface WalkerRepository extends MongoRepository<Walker, String> {
    Optional<Walker> findByEmail(String email);
}
