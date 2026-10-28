import { LegalLayout } from './CancellationPage';

const SECTIONS = [
  {
    title: 'Sobre o Rolê de Pet',
    paragraphs: [
      'O Rolê de Pet é uma plataforma que conecta tutores de cães a dog walkers independentes. A plataforma não presta diretamente o serviço de passeio: ela oferece as ferramentas para encontrar profissionais, solicitar, pagar e acompanhar passeios.',
    ],
  },
  {
    title: 'Contas e perfis',
    paragraphs: [
      'Uma mesma conta pode atuar como tutor e como dog walker. Você é responsável pela veracidade das informações do seu perfil e dos perfis dos seus pets.',
      'O perfil do pet deve conter informações completas sobre comportamento, equipamentos e saúde. Omitir informações relevantes para a segurança pode levar à suspensão da conta.',
    ],
  },
  {
    title: 'Solicitações e aceite',
    paragraphs: [
      'O tutor envia uma solicitação; o dog walker analisa o perfil do pet e decide se aceita ou recusa. A reserva só é confirmada após o pagamento.',
      'Solicitações sem resposta expiram no horário previsto para o passeio.',
    ],
  },
  {
    title: 'Pagamentos',
    paragraphs: [
      'O pagamento é feito após o aceite e repassado ao dog walker em duas parcelas, descontada a taxa de serviço de 15%: 50% na confirmação do passeio e 50% quando ele é finalizado. A avaliação do tutor não interfere no repasse.',
      'Estornos seguem a política de cancelamento.',
    ],
  },
  {
    title: 'Conduta durante o passeio',
    paragraphs: [
      'O dog walker deve seguir as orientações do perfil do pet, confirmar a retirada com o código do tutor e manter a tela do passeio aberta para permitir o acompanhamento.',
      'Passeios são individuais nesta versão do produto.',
    ],
  },
  {
    title: 'Avaliações',
    paragraphs: ['Avaliações devem refletir experiências reais de passeios concluídos. Conteúdo ofensivo ou falso poderá ser removido.'],
  },
  {
    title: 'Limitações deste protótipo',
    paragraphs: [
      'Esta é uma versão demonstrativa. Autenticação, verificações, pagamentos, localização e suporte são simulados e não geram obrigações reais entre as partes.',
    ],
  },
];

export default function TermsPage() {
  return <LegalLayout title="Termos de uso" updated="outubro de 2026" sections={SECTIONS} />;
}
