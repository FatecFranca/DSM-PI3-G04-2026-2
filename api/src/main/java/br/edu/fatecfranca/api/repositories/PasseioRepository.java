package br.edu.fatecfranca.api.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import br.edu.fatecfranca.api.models.Passeio;

public interface PasseioRepository extends MongoRepository<Passeio, String> {
}