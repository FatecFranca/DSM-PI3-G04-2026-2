// Seed: importa os dados de demonstração do protótipo (frontend/src/data/mock)
// para o banco real, via API REST.
//
// Uso:
//   1. Suba a API:      cd api; ./mvnw spring-boot:run  (ou mvnw.cmd no Windows)
//   2. Rode o seed:     node api/scripts/seed.mjs       (ou npm run seed, em frontend/)
//
// É idempotente: itens que já existem (mesmo id) são pulados. As datas dos
// bookings são relativas ao dia atual, então reseedar renova a demonstração.
// Senha de todas as contas de demonstração: "senha123".

import { mockWalkers } from '../../frontend/src/data/mock/walkers.js';
import { mockUsers } from '../../frontend/src/data/mock/users.js';
import { mockPets } from '../../frontend/src/data/mock/pets.js';
import { mockBookings } from '../../frontend/src/data/mock/bookings.js';
import { createSeedState } from '../../frontend/src/data/mock/index.js';

const BASE = process.env.VITE_API_URL ?? 'http://localhost:8888';
const DEMO_PASSWORD = 'senha123';

const favorites = createSeedState().favorites;

async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${options.method ?? 'GET'} ${path} → ${res.status}: ${body}`);
  }
  return res.status === 204 ? null : res.json();
}

/** E-mail da conta vinculada ao perfil de walker (gerado no users.js do front). */
const emailForWalker = (walkerId) =>
  mockUsers.find((u) => u.walkerProfileId === walkerId)?.email ?? `${walkerId}@roledepet.demo`;

async function seedCollection(listPath, createPath, items, build) {
  const existing = new Set((await api(listPath)).map((doc) => doc.id));
  let created = 0;
  for (const item of items) {
    if (existing.has(item.id)) continue;
    await api(createPath, { method: 'POST', body: JSON.stringify(build(item)) });
    created++;
  }
  return created;
}

try {
  const tutores = await seedCollection('/tutores', '/tutores', mockUsers, (u) => ({
    ...u,
    favorites: favorites[u.id] ?? [],
    password: DEMO_PASSWORD,
  }));

  const walkers = await seedCollection('/walkers', '/walkers', mockWalkers, (w) => ({
    ...w,
    email: emailForWalker(w.id),
    password: DEMO_PASSWORD,
  }));

  const pets = await seedCollection('/pets', '/pets', mockPets, (p) => p);

  // Passeios entram por rota de importação: objetos completos com status
  // arbitrário não passam pelas regras de nova solicitação (Fase 4).
  const passeios = await seedCollection('/passeios', '/passeios/importar', mockBookings, (b) => b);

  console.log(
    `Seed concluído: ${tutores} tutores, ${walkers} walkers, ${pets} pets, ${passeios} passeios criados. Senha demo: "${DEMO_PASSWORD}".`,
  );
} catch (error) {
  console.error('Falha no seed. A API está no ar?', error.message);
  process.exitCode = 1;
}
