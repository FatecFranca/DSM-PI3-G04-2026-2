package br.edu.fatecfranca.api;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import br.edu.fatecfranca.api.models.Tutor;
import br.edu.fatecfranca.api.models.Walker;
import br.edu.fatecfranca.api.repositories.TutorRepository;
import br.edu.fatecfranca.api.repositories.WalkerRepository;
import br.edu.fatecfranca.api.services.TutorService;

/**
 * Testa o toggle de favoritos contra o Atlas real (o projeto não usa banco em memória).
 * Cria documentos temporários com ids únicos e os remove no fim.
 */
@SpringBootTest
class TutorFavoritosTests {

    @Autowired
    private TutorRepository tutorRepository;

    @Autowired
    private WalkerRepository walkerRepository;

    @Autowired
    private TutorService tutorService;

    @Test
    void alternarFavoritoLigaEDesliga() {
        String sufixo = UUID.randomUUID().toString().substring(0, 8);

        Tutor tutor = new Tutor();
        tutor.setId("test-tutor-" + sufixo);
        tutor.setName("Teste Favoritos");
        tutor.setEmail("teste-favoritos-" + sufixo + "@roledepet.demo");
        tutor.setRoles(new ArrayList<>(List.of("owner")));
        tutorRepository.save(tutor);

        Walker walker = new Walker();
        walker.setId("test-walker-" + sufixo);
        walker.setName("Teste Walker");
        walkerRepository.save(walker);

        try {
            Tutor comFavorito = tutorService.alternarFavorito(tutor.getId(), walker.getId());
            assertTrue(comFavorito.getFavorites().contains(walker.getId()));

            Tutor semFavorito = tutorService.alternarFavorito(tutor.getId(), walker.getId());
            assertFalse(semFavorito.getFavorites().contains(walker.getId()));
        } finally {
            tutorRepository.deleteById(tutor.getId());
            walkerRepository.deleteById(walker.getId());
        }
    }
}
