import { LegalLayout } from './CancellationPage';

const SECTIONS = [
  {
    title: 'Dados que coletamos',
    paragraphs: [
      'Dados de cadastro (nome, e-mail, telefone, endereço), perfis dos pets (incluindo informações de saúde e comportamento), histórico de passeios, mensagens, avaliações e, durante o passeio, a localização do dog walker.',
      'Para dog walkers, também documentos de identidade e, mediante consentimento, a consulta de antecedentes.',
    ],
  },
  {
    title: 'Localização: um dado sensível',
    paragraphs: [
      'A localização é coletada apenas enquanto um passeio está em andamento e somente com o consentimento do dog walker, que pode ser revogado a qualquer momento.',
      'Ela fica visível apenas para o tutor responsável e para as pessoas com quem ele decidir compartilhar o acompanhamento. Links de compartilhamento expiram ao fim do passeio.',
      'As rotas são mantidas por tempo limitado, apenas pelo necessário para o histórico do passeio e para eventual resolução de problemas, e depois são excluídas ou anonimizadas.',
    ],
  },
  {
    title: 'Para que usamos os dados',
    paragraphs: ['Para viabilizar as solicitações, o pagamento protegido, o acompanhamento ao vivo, a segurança dos pets e o suporte. Não vendemos dados pessoais.'],
  },
  {
    title: 'Base legal e seus direitos (LGPD)',
    paragraphs: [
      'O tratamento segue a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Você pode solicitar confirmação, acesso, correção, portabilidade e exclusão dos seus dados, além de revogar consentimentos.',
      'Haverá um encarregado de proteção de dados (DPO) com canal de contato público na versão em produção.',
    ],
  },
  {
    title: 'Segurança e controle de acesso',
    paragraphs: ['Os dados serão armazenados com criptografia e acesso restrito por perfil. Informações do pet só ficam visíveis ao dog walker a partir da solicitação.'],
  },
  {
    title: 'Neste protótipo',
    paragraphs: [
      'Os dados de demonstração ficam salvos apenas no seu navegador (armazenamento local) e podem ser apagados pelo menu da conta, em "Restaurar dados de demonstração". Senhas nunca são armazenadas e nenhuma localização real é coletada.',
    ],
  },
];

export default function PrivacyPage() {
  return <LegalLayout title="Política de privacidade" updated="outubro de 2026" sections={SECTIONS} />;
}
