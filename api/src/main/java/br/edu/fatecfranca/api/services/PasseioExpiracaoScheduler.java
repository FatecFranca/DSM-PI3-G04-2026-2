package br.edu.fatecfranca.api.services;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Expiração periódica das solicitações/aceites vencidos no servidor.
 * O front também expira localmente (mesma regra) para funcionar offline —
 * os dois lados convergem na próxima hidratação.
 */
@Component
public class PasseioExpiracaoScheduler {

    private final PasseioService passeioService;

    public PasseioExpiracaoScheduler(PasseioService passeioService) {
        this.passeioService = passeioService;
    }

    @Scheduled(fixedRate = 60_000, initialDelay = 60_000)
    public void expirarVencidos() {
        passeioService.expirarVencidos();
    }
}
