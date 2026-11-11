package br.edu.fatecfranca.api.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import br.edu.fatecfranca.api.models.Walker;

public interface WalkerRepository extends MongoRepository<Walker, String> {
}