package br.edu.fatecfranca.api.repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import br.edu.fatecfranca.api.models.Passeio;

public interface PasseioRepository extends MongoRepository<Passeio, String> {

    /** Passeios de um walker em uma data (usado pela validação de disponibilidade). */
    List<Passeio> findByWalkerIdAndDate(String walkerId, String date);
}