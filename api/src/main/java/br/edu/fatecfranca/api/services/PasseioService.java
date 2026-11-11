package br.edu.fatecfranca.api.services;

import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import br.edu.fatecfranca.api.dtos.PasseioResponse;
import br.edu.fatecfranca.api.models.Passeio;
import br.edu.fatecfranca.api.models.Pet;
import br.edu.fatecfranca.api.models.Walker;
import br.edu.fatecfranca.api.repositories.PasseioRepository;
import br.edu.fatecfranca.api.repositories.PetRepository;
import br.edu.fatecfranca.api.repositories.WalkerRepository;

@Service
public class PasseioService {

    private final PasseioRepository repository;
    private final WalkerRepository walkerRepository;
    private final PetRepository petRepository;

    public PasseioService(PasseioRepository repository, WalkerRepository walkerRepository, PetRepository petRepository) {
        this.repository = repository;
        this.walkerRepository = walkerRepository;
        this.petRepository = petRepository;
    }

    private void verificarVinculos(String walkerId, String petId) {
        if (!walkerRepository.existsById(walkerId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Walker não encontrado.");
        }
        if (!petRepository.existsById(petId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pet não encontrado.");
        }
    }

    private PasseioResponse montarResposta(Passeio passeio) {
        Walker walker = walkerRepository.findById(passeio.getWalkerId()).orElse(null);
        Pet pet = petRepository.findById(passeio.getPetId()).orElse(null);

        return new PasseioResponse(
            passeio.getId(),
            passeio.getWalkerId(),
            passeio.getPetId(),
            passeio.getData(),
            passeio.getStatus(),
            walker,
            pet
        );
    }

    public List<PasseioResponse> listarTodos() {
        return repository.findAll().stream().map(this::montarResposta).toList();
    }

    public Optional<PasseioResponse> buscarPorId(String id) {
        return repository.findById(id).map(this::montarResposta);
    }

    public PasseioResponse salvar(Passeio passeio) {
        verificarVinculos(passeio.getWalkerId(), passeio.getPetId());
        Passeio passeioSalvo = repository.save(passeio);
        return montarResposta(passeioSalvo);
    }

    public void excluir(String id) {
        repository.deleteById(id);
    }
}