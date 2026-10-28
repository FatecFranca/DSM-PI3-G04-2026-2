// Help center content. In production this would come from a CMS.

export const HELP_CATEGORIES = [
  { id: 'tutores', label: 'Tutores' },
  { id: 'dog-walkers', label: 'Dog walkers' },
  { id: 'pagamentos', label: 'Pagamentos' },
  { id: 'emergencia', label: 'Segurança e emergência' },
  { id: 'conta', label: 'Conta' },
];

export const FAQS = [
  // ---- Tutores ----
  {
    id: 'f1',
    category: 'tutores',
    question: 'Como solicito um passeio?',
    answer:
      'Busque pelo seu bairro, escolha um dog walker e, no perfil dele, selecione o pet, a data, o horário e a duração. Toque em "Solicitar passeio". O profissional analisa o perfil do seu pet e aceita ou recusa a solicitação.',
  },
  {
    id: 'f2',
    category: 'tutores',
    question: 'Por que preciso preencher o perfil completo do meu pet?',
    answer:
      'O dog walker lê o perfil antes de aceitar. Informações como gatilhos, reatividade, uso de focinheira e horários de medicação ajudam o profissional a decidir se está preparado e a conduzir o passeio com segurança.',
  },
  {
    id: 'f3',
    category: 'tutores',
    question: 'O que é o alerta de segurança do pet?',
    answer:
      'É um campo curto, exibido em destaque para o dog walker antes de aceitar e durante todo o passeio. Use para o que não pode ser esquecido: "Focinheira obrigatória", "Reativo com cães machos", "Medicação às 12h".',
  },
  {
    id: 'f4',
    category: 'tutores',
    question: 'Como acompanho o passeio?',
    answer:
      'Quando o dog walker sai para buscar o pet, o passeio aparece na aba "Ao vivo". Lá você vê o mapa, a rota percorrida, o tempo decorrido e a previsão de retorno. Neste protótipo, a localização é simulada.',
  },
  {
    id: 'f5',
    category: 'tutores',
    question: 'Para que serve o código de retirada?',
    answer:
      'Ao chegar, o dog walker pede um código de 4 dígitos exibido no seu app. Ele só consegue confirmar a retirada com o código correto — assim você sabe que o pet foi entregue à pessoa certa.',
  },
  {
    id: 'f6',
    category: 'tutores',
    question: 'Posso contratar o mesmo dog walker de novo?',
    answer: 'Sim. Em "Passeios" › "Concluídos", toque em "Contratar de novo". O pet e a duração já vêm selecionados; você só escolhe a nova data.',
  },
  // ---- Dog walkers ----
  {
    id: 'f7',
    category: 'dog-walkers',
    question: 'Como me torno dog walker no Rolê de Pet?',
    answer:
      'Crie uma conta escolhendo "Quero ser dog walker", complete o perfil profissional (biografia, experiência, portes atendidos, preços e disponibilidade) e envie os documentos para verificação de identidade e antecedentes.',
  },
  {
    id: 'f8',
    category: 'dog-walkers',
    question: 'Posso recusar uma solicitação?',
    answer:
      'Sim. Antes de aceitar você vê o perfil completo do pet — comportamento, equipamentos, saúde e alertas. Se não se sentir preparado, recuse. O tutor é avisado e nada é cobrado.',
  },
  {
    id: 'f9',
    category: 'dog-walkers',
    question: 'Como bloqueio horários na minha agenda?',
    answer: 'Em "Agenda", escolha a data e toque nos horários que deseja bloquear. Horários bloqueados deixam de aparecer para os tutores na hora de solicitar.',
  },
  {
    id: 'f10',
    category: 'dog-walkers',
    question: 'Quando recebo pelos passeios?',
    answer:
      'Em duas parcelas, já descontada a taxa de serviço de 15%: 50% assim que o tutor paga e o passeio fica fechado, e os outros 50% quando você finaliza o passeio no app. A avaliação do tutor não interfere no pagamento.',
  },
  {
    id: 'f11',
    category: 'dog-walkers',
    question: 'Preciso deixar o app aberto durante o passeio?',
    answer:
      'Sim. Mantenha a tela do passeio aberta para permitir o acompanhamento da localização. Navegadores de celular não garantem rastreamento confiável em segundo plano.',
  },
  // ---- Pagamentos ----
  {
    id: 'f12',
    category: 'pagamentos',
    question: 'Quando sou cobrado?',
    answer: 'Somente depois que o dog walker aceita a solicitação. Até lá, nenhum valor é cobrado.',
  },
  {
    id: 'f13',
    category: 'pagamentos',
    question: 'Como o pagamento é repassado ao dog walker?',
    answer:
      'Quando você paga, metade do valor vai para o dog walker na hora, garantindo o horário dele. A outra metade fica retida pela plataforma e é liberada quando ele finaliza o passeio. Se o passeio não acontecer por decisão do dog walker, você recebe tudo de volta.',
  },
  {
    id: 'f14',
    category: 'pagamentos',
    question: 'Quais formas de pagamento são aceitas?',
    answer:
      'O produto prevê cartão de crédito e Pix. Neste protótipo os pagamentos são simulados e nenhum dado de cartão é solicitado.',
  },
  {
    id: 'f15',
    category: 'pagamentos',
    question: 'Como funciona o reembolso em caso de cancelamento?',
    answer: 'Antes do pagamento, cancelar não custa nada. Depois do pagamento, se você cancelar, a metade ainda retida é devolvida e a primeira metade fica com o dog walker pelo horário reservado; se o dog walker cancelar, o estorno é integral. Veja a página de cancelamentos para os detalhes.',
  },
  // ---- Segurança / emergência ----
  {
    id: 'f16',
    category: 'emergencia',
    question: 'O que faço em uma emergência durante o passeio?',
    answer:
      'Na tela de acompanhamento, toque em "Preciso de ajuda". Você poderá falar com o suporte e acessar os contatos de emergência e do veterinário cadastrados no perfil do pet. Em situações de risco à vida, ligue diretamente para os serviços de emergência (192 / 193). Neste protótipo, o fluxo de ajuda é demonstrativo e não aciona nenhum serviço real.',
  },
  {
    id: 'f17',
    category: 'emergencia',
    question: 'Como funciona a verificação dos dog walkers?',
    answer:
      'O produto prevê verificação de identidade e consulta de antecedentes, sujeitas a análise legal. O selo "Verificado" só aparece para perfis com as duas etapas aprovadas. Neste protótipo, as verificações são simuladas.',
  },
  {
    id: 'f18',
    category: 'emergencia',
    question: 'Posso compartilhar o acompanhamento com outra pessoa?',
    answer:
      'Sim, pela opção "Compartilhar acompanhamento" na tela do passeio ao vivo. No protótipo, o link gerado é apenas demonstrativo e não expõe nenhuma localização.',
  },
  {
    id: 'f19',
    category: 'emergencia',
    question: 'O que acontece se o pet fugir ou se machucar?',
    answer:
      'O dog walker deve avisar você imediatamente pelo app e acionar o suporte. Os contatos de emergência e do veterinário de referência ficam visíveis para ele durante o passeio.',
  },
  // ---- Conta ----
  {
    id: 'f20',
    category: 'conta',
    question: 'Posso ser tutor e dog walker na mesma conta?',
    answer: 'Sim. Pelo menu da conta, use "Alternar para modo dog walker" ou "Alternar para modo tutor". A navegação e as cores mudam conforme o modo.',
  },
  {
    id: 'f21',
    category: 'conta',
    question: 'Como edito meus dados e contatos de emergência?',
    answer: 'No modo tutor, acesse "Perfil" na barra inferior (ou "Conta e pagamentos" no menu). Lá você edita dados pessoais, formas de pagamento e contatos de emergência.',
  },
  {
    id: 'f22',
    category: 'conta',
    question: 'Meus dados ficam salvos?',
    answer:
      'Neste protótipo, os dados de demonstração ficam salvos apenas no seu navegador. Senhas nunca são armazenadas. Você pode restaurar os dados iniciais pelo menu da conta.',
  },
];
