package br.edu.fatecfranca.api.dtos;

/**
 * Corpos de requisição dos endpoints de passeio (Fase 4).
 * Os nomes seguem o domínio do front (inglês, camelCase).
 */
public final class PasseioDtos {

    /** POST /passeios — solicitação de passeio do tutor. */
    public record SolicitacaoRequest(
            String ownerId,
            String walkerId,
            String petId,
            String date,
            String time,
            Integer duration,
            String notes) {
    }

    /** POST /passeios/{id}/transicoes — {to, actor}. */
    public record TransicaoRequest(String to, String actor) {
    }

    /** POST /passeios/{id}/pagamento — {methodId}. */
    public record PagamentoRequest(String methodId) {
    }

    /** POST /passeios/{id}/retirada — {code}. */
    public record RetiradaRequest(String code) {
    }

    /** POST /passeios/{id}/avaliacao — {rating, comment}. */
    public record AvaliacaoRequest(Integer rating, String comment) {
    }

    private PasseioDtos() {
    }
}
