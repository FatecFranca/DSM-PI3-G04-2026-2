package br.edu.fatecfranca.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import br.edu.fatecfranca.api.models.BookingStateMachine;
import br.edu.fatecfranca.api.models.BookingStatus;

/**
 * Teste puro da máquina de estados (sem banco): as transições válidas por ator
 * espelham o bookingStateMachine.js do front.
 */
class BookingStateMachineTests {

    @Test
    void walkerPodeAceitarERecusarSolicitacao() {
        assertTrue(BookingStateMachine.podeTransicionar(BookingStatus.REQUESTED, BookingStatus.ACCEPTED, "walker"));
        assertTrue(BookingStateMachine.podeTransicionar(BookingStatus.REQUESTED, BookingStatus.DECLINED, "walker"));
        assertFalse(BookingStateMachine.podeTransicionar(BookingStatus.REQUESTED, BookingStatus.ACCEPTED, "owner"));
    }

    @Test
    void ownerPodePagarECancelarAposAceite() {
        assertTrue(BookingStateMachine.podeTransicionar(BookingStatus.ACCEPTED, BookingStatus.PAID, "owner"));
        assertTrue(BookingStateMachine.podeTransicionar(BookingStatus.ACCEPTED, BookingStatus.CANCELED, "owner"));
        assertTrue(BookingStateMachine.podeTransicionar(BookingStatus.ACCEPTED, BookingStatus.CANCELED, "walker"));
        assertFalse(BookingStateMachine.podeTransicionar(BookingStatus.ACCEPTED, BookingStatus.ON_THE_WAY, "walker"));
    }

    @Test
    void somenteWalkerConduzOEtapaOperacional() {
        assertTrue(BookingStateMachine.podeTransicionar(BookingStatus.PAID, BookingStatus.ON_THE_WAY, "walker"));
        assertTrue(BookingStateMachine.podeTransicionar(BookingStatus.ON_THE_WAY, BookingStatus.PICKED_UP, "walker"));
        assertTrue(BookingStateMachine.podeTransicionar(BookingStatus.PICKED_UP, BookingStatus.WALKING, "walker"));
        assertTrue(BookingStateMachine.podeTransicionar(BookingStatus.WALKING, BookingStatus.RETURNING, "system"));
        assertTrue(BookingStateMachine.podeTransicionar(BookingStatus.RETURNING, BookingStatus.COMPLETED, "walker"));
        assertTrue(BookingStateMachine.podeTransicionar(BookingStatus.COMPLETED, BookingStatus.REVIEWED, "owner"));
        assertFalse(BookingStateMachine.podeTransicionar(BookingStatus.COMPLETED, BookingStatus.REVIEWED, "walker"));
        assertFalse(BookingStateMachine.podeTransicionar(BookingStatus.PAID, BookingStatus.PICKED_UP, "walker"));
    }

    @Test
    void statusFechadosSaoTerminais() {
        for (String status : new String[] { BookingStatus.DECLINED, BookingStatus.EXPIRED, BookingStatus.CANCELED, BookingStatus.REVIEWED }) {
            assertFalse(BookingStateMachine.podeTransicionar(status, BookingStatus.ACCEPTED, "walker"));
            assertFalse(BookingStateMachine.podeTransicionar(status, BookingStatus.CANCELED, "owner"));
        }
    }

    @Test
    void mensagemDeErroUsaOsRotulosDoFront() {
        String mensagem = BookingStateMachine.mensagemTransicaoInvalida(BookingStatus.ACCEPTED, BookingStatus.ON_THE_WAY);
        assertEquals("Não é possível mudar de \"Aceito\" para \"A caminho\".", mensagem);
    }
}
