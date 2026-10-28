// Centralized labels and enumerations used across the product.

export const APP_MODES = { OWNER: 'owner', WALKER: 'walker' };

export const DOG_SIZES = [
  { id: 'mini', label: 'Mini', hint: 'até 5 kg' },
  { id: 'pequeno', label: 'Pequeno', hint: '5 a 10 kg' },
  { id: 'medio', label: 'Médio', hint: '10 a 25 kg' },
  { id: 'grande', label: 'Grande', hint: '25 a 45 kg' },
  { id: 'gigante', label: 'Gigante', hint: 'acima de 45 kg' },
];
export const DOG_SIZE_LABEL = Object.fromEntries(DOG_SIZES.map((s) => [s.id, s.label]));

export const TEMPERAMENTS = [
  { id: 'tranquilo', label: 'Tranquilo' },
  { id: 'agitado', label: 'Agitado' },
  { id: 'reativo', label: 'Reativo' },
  { id: 'medroso', label: 'Medroso' },
];
export const TEMPERAMENT_LABEL = Object.fromEntries(TEMPERAMENTS.map((t) => [t.id, t.label]));

export const REACTIVITY_LEVELS = [
  { id: 'nenhuma', label: 'Não é reativo' },
  { id: 'leve', label: 'Leve — late, mas se acalma' },
  { id: 'moderada', label: 'Moderada — precisa de distância' },
  { id: 'alta', label: 'Alta — exige manejo experiente' },
];
export const REACTIVITY_LABEL = Object.fromEntries(REACTIVITY_LEVELS.map((r) => [r.id, r.label]));

export const DOG_SOCIABILITY = [
  { id: 'sociavel', label: 'Sociável com outros cães' },
  { id: 'seletivo', label: 'Seletivo — depende do cão' },
  { id: 'evitar', label: 'Evitar contato com outros cães' },
];
export const DOG_SOCIABILITY_LABEL = Object.fromEntries(DOG_SOCIABILITY.map((s) => [s.id, s.label]));

export const WALK_DURATIONS = [30, 45, 60, 90];

export const DISCOVERY_CATEGORIES = [
  { id: 'grandes', label: 'Cães grandes', description: 'Força e manejo para portes grandes e gigantes' },
  { id: 'reativos', label: 'Cães reativos', description: 'Profissionais com experiência em reatividade' },
  { id: 'filhotes', label: 'Filhotes', description: 'Paciência e socialização nos primeiros meses' },
  { id: 'idosos', label: 'Cães idosos', description: 'Ritmo leve e atenção às limitações' },
  { id: 'medicacao', label: 'Cães com medicação', description: 'Administração de remédios no horário certo' },
];

export const SORT_OPTIONS = [
  { id: 'relevancia', label: 'Relevância' },
  { id: 'menor-preco', label: 'Menor preço' },
  { id: 'melhor-avaliacao', label: 'Melhor avaliação' },
  { id: 'mais-passeios', label: 'Mais passeios' },
];

export const PLATFORM_FEE_RATE = 0.15;

export const CITY_DEFAULT = 'São Paulo, SP';

export const NEIGHBORHOODS = [
  'Pinheiros',
  'Vila Madalena',
  'Moema',
  'Vila Mariana',
  'Perdizes',
  'Itaim Bibi',
  'Jardins',
  'Tatuapé',
  'Santana',
  'Mooca',
  'Butantã',
  'Brooklin',
  'Aclimação',
  'Lapa',
  'Higienópolis',
  'Campo Belo',
  'Consolação',
  'Vila Olímpia',
];

export const STORAGE_KEY = 'roledepet:estado:v1';
export const SESSION_KEY = 'roledepet:sessao:v1';
