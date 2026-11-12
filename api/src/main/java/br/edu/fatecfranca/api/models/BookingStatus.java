package br.edu.fatecfranca.api.models;

import java.util.List;
import java.util.Set;

/**
 * Espelha BOOKING_STATUS do frontend (src/features/bookings/bookingStateMachine.js).
 * As transições válidas por ator são portadas na Fase 4; aqui só existe o
 * vocabulário de status para validar o que chega na API.
 */
public final class BookingStatus {

    public static final String REQUESTED = "requested";
    public static final String ACCEPTED = "accepted";
    public static final String PAID = "paid";
    public static final String ON_THE_WAY = "on_the_way";
    public static final String PICKED_UP = "picked_up";
    public static final String WALKING = "walking";
    public static final String RETURNING = "returning";
    public static final String COMPLETED = "completed";
    public static final String REVIEWED = "reviewed";
    public static final String DECLINED = "declined";
    public static final String EXPIRED = "expired";
    public static final String CANCELED = "canceled";

    /** Fluxo principal (feliz), na ordem usada pelas linhas do tempo do front. */
    public static final List<String> MAIN_FLOW = List.of(
            REQUESTED, ACCEPTED, PAID, ON_THE_WAY, PICKED_UP, WALKING, RETURNING, COMPLETED, REVIEWED);

    public static final Set<String> ALL = Set.of(
            REQUESTED, ACCEPTED, PAID, ON_THE_WAY, PICKED_UP, WALKING, RETURNING,
            COMPLETED, REVIEWED, DECLINED, EXPIRED, CANCELED);

    private BookingStatus() {
    }
}
