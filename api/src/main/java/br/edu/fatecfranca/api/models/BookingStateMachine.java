package br.edu.fatecfranca.api.models;

import java.util.Map;
import java.util.Set;

/**
 * Espelho literal da máquina de transições do front
 * (src/features/bookings/bookingStateMachine.js): de qual status é possível ir
 * para quais outros, e com qual ator (owner/walker/system). Toda mudança de
 * status de passeio passa por aqui — movimentos inválidos são impossíveis.
 */
public final class BookingStateMachine {

    /** Rótulos do front (STATUS_META), usados nas mensagens de erro. */
    private static final Map<String, String> LABELS = Map.ofEntries(
            Map.entry(BookingStatus.REQUESTED, "Solicitado"),
            Map.entry(BookingStatus.ACCEPTED, "Aceito"),
            Map.entry(BookingStatus.PAID, "Pago e confirmado"),
            Map.entry(BookingStatus.ON_THE_WAY, "A caminho"),
            Map.entry(BookingStatus.PICKED_UP, "Retirada confirmada"),
            Map.entry(BookingStatus.WALKING, "Em passeio"),
            Map.entry(BookingStatus.RETURNING, "Voltando"),
            Map.entry(BookingStatus.COMPLETED, "Concluído"),
            Map.entry(BookingStatus.REVIEWED, "Avaliado"),
            Map.entry(BookingStatus.DECLINED, "Recusado"),
            Map.entry(BookingStatus.EXPIRED, "Expirado"),
            Map.entry(BookingStatus.CANCELED, "Cancelado"));

    /** Transições válidas: de -> para -> atores permitidos. */
    private static final Map<String, Map<String, Set<String>>> TRANSITIONS = Map.ofEntries(
            Map.entry(BookingStatus.REQUESTED, Map.of(
                    BookingStatus.ACCEPTED, Set.of("walker"),
                    BookingStatus.DECLINED, Set.of("walker"),
                    BookingStatus.CANCELED, Set.of("owner"),
                    BookingStatus.EXPIRED, Set.of("system"))),
            Map.entry(BookingStatus.ACCEPTED, Map.of(
                    BookingStatus.PAID, Set.of("owner"),
                    BookingStatus.CANCELED, Set.of("owner", "walker"),
                    BookingStatus.EXPIRED, Set.of("system"))),
            Map.entry(BookingStatus.PAID, Map.of(
                    BookingStatus.ON_THE_WAY, Set.of("walker"),
                    BookingStatus.CANCELED, Set.of("owner", "walker"))),
            Map.entry(BookingStatus.ON_THE_WAY, Map.of(
                    BookingStatus.PICKED_UP, Set.of("walker"),
                    BookingStatus.CANCELED, Set.of("walker"))),
            Map.entry(BookingStatus.PICKED_UP, Map.of(
                    BookingStatus.WALKING, Set.of("walker"))),
            Map.entry(BookingStatus.WALKING, Map.of(
                    BookingStatus.RETURNING, Set.of("walker", "system"))),
            Map.entry(BookingStatus.RETURNING, Map.of(
                    BookingStatus.COMPLETED, Set.of("walker"))),
            Map.entry(BookingStatus.COMPLETED, Map.of(
                    BookingStatus.REVIEWED, Set.of("owner"))),
            Map.entry(BookingStatus.REVIEWED, Map.of()),
            Map.entry(BookingStatus.DECLINED, Map.of()),
            Map.entry(BookingStatus.EXPIRED, Map.of()),
            Map.entry(BookingStatus.CANCELED, Map.of()));

    public static String label(String status) {
        return LABELS.getOrDefault(status, status);
    }

    public static boolean podeTransicionar(String from, String to, String actor) {
        Set<String> atores = TRANSITIONS.getOrDefault(from, Map.of()).get(to);
        return atores != null && atores.contains(actor);
    }

    /** Mensagem idêntica à do front (bookingService.transitionBooking). */
    public static String mensagemTransicaoInvalida(String from, String to) {
        return String.format("Não é possível mudar de \"%s\" para \"%s\".", label(from), label(to));
    }

    private BookingStateMachine() {
    }
}
