import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createSeedState, SEED_VERSION } from '../data/mock';
import { STORAGE_KEY, SESSION_KEY, APP_MODES } from '../utils/constants';
import { loadJSON, saveJSON, removeKeys } from '../utils/storage';
import { api } from '../api';
import * as bookingService from '../services/bookingService';
import * as authService from '../services/authService';
import * as catalogSync from '../services/catalogSync';
import * as petService from '../services/petService';
import * as messageService from '../services/messageService';
import * as paymentService from '../services/paymentService';
import * as walkerService from '../services/walkerService';
import * as notificationService from '../services/notificationService';

// Single source of truth for the prototype.
// - `data`: the whole demo database (persisted to localStorage, debounced)
// - `session`: who is signed in and the current mode (tutor / dog walker)
// - `actions`: domain operations; each one runs a pure service function on the
//   latest state and commits the result. Errors thrown by services propagate to the caller.

const DataContext = createContext(null);
const SessionContext = createContext(null);
const ActionsContext = createContext(null);

const DEFAULT_SESSION = { userId: null, mode: APP_MODES.OWNER };

function loadInitialData() {
  const saved = loadJSON(STORAGE_KEY);
  if (saved && saved.version === SEED_VERSION && Array.isArray(saved.bookings)) return saved;
  return createSeedState();
}

export function AppStoreProvider({ children }) {
  const [data, setData] = useState(loadInitialData);
  const [session, setSession] = useState(() => {
    // eslint-disable-next-line no-unused-vars
    const { actingWalkerId, ...saved } = loadJSON(SESSION_KEY) || {};
    return { ...DEFAULT_SESSION, ...saved };
  });
  const dataRef = useRef(data);
  const sessionRef = useRef(session);

  // Persist (debounced — the tracking engine updates every second)
  useEffect(() => {
    const id = setTimeout(() => saveJSON(STORAGE_KEY, data), 400);
    return () => clearTimeout(id);
  }, [data]);
  useEffect(() => {
    saveJSON(SESSION_KEY, session);
    document.documentElement.dataset.mode = session.mode;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', session.mode === APP_MODES.WALKER ? '#F9A825' : '#7A2145');
  }, [session]);

  /** Runs fn(latestState) → state | { state, ...result }; commits and returns the result */
  const commit = useCallback((fn) => {
    const output = fn(dataRef.current);
    const isWrapped = output && typeof output === 'object' && 'state' in output && output.state?.bookings;
    const nextState = isWrapped ? output.state : output;
    if (nextState && nextState !== dataRef.current) {
      dataRef.current = nextState;
      setData(nextState);
    }
    if (isWrapped) {
      // eslint-disable-next-line no-unused-vars
      const { state, ...rest } = output;
      return rest;
    }
    return undefined;
  }, []);

  const updateSession = useCallback((changes) => {
    sessionRef.current = { ...sessionRef.current, ...changes };
    setSession(sessionRef.current);
  }, []);

  /** Contas vindas só da API (ex.: cadastro novo) precisam existir no estado local */
  const garantirUsuarioLocal = useCallback((user) => {
    if (!user || dataRef.current.users.some((u) => u.id === user.id)) return;
    commit((s) => ({
      ...s,
      users: [...s.users, user],
      favorites: { ...s.favorites, [user.id]: user.favorites ?? [] },
    }));
  }, [commit]);

  const actions = useMemo(() => {
    const currentUser = () => dataRef.current.users.find((u) => u.id === sessionRef.current.userId);
    // The walker profile always belongs to the signed-in account
    const myWalkerId = () => currentUser()?.walkerProfileId;
    /** Empurra para a API a versão atual do perfil de walker do usuário logado */
    const sincronizarWalker = () => {
      const walker = dataRef.current.walkers.find((w) => w.id === myWalkerId());
      if (walker) catalogSync.upsertWalker(walker);
    };
    /** Empurra para a API a versão atual da conta do usuário logado */
    const sincronizarUsuario = () => {
      const user = currentUser();
      if (user) catalogSync.upsertUser(user);
    };
    /** Mode to start in: the requested one if the account has that role, else its primary role */
    const startMode = (user, preferred) => {
      if (preferred === APP_MODES.WALKER && user.walkerProfileId) return APP_MODES.WALKER;
      if (preferred === APP_MODES.OWNER && user.roles.includes('owner')) return APP_MODES.OWNER;
      return user.roles[0] === 'walker' ? APP_MODES.WALKER : APP_MODES.OWNER;
    };
    /** Envia a transição ao backend e aplica o retorno ao estado local */
    const transicionarRemoto = async (bookingId, to, actor) => {
      const local = dataRef.current.bookings.find((b) => b.id === bookingId);
      const server = await bookingService.transicionarNaApi(bookingId, to, actor);
      commit((s) => bookingService.aplicarBookingRemoto(s, server, local, to));
      return server;
    };

    return {
      commit,
      // ---- auth & session ----
      signIn: async (credentials, preferredMode) => {
        const user = await authService.signIn(dataRef.current, credentials);
        garantirUsuarioLocal(user);
        updateSession({ userId: user.id, mode: startMode(user, preferredMode) });
        return user;
      },
      /** Demo shortcut: real login with the shared demo password */
      signInAs: async (userId, preferredMode) => {
        const demoUser = dataRef.current.users.find((u) => u.id === userId);
        if (!demoUser) return null;
        const user = await authService.signInWithDemoPassword(demoUser.email);
        garantirUsuarioLocal(user);
        updateSession({ userId: user.id, mode: startMode(user, preferredMode) });
        return user;
      },
      signUp: async (input) => {
        const apiUser = await authService.signUp(input);
        // O perfil de dog walker (não verificado) continua nascendo local;
        // a conta em si já está no banco via API.
        const walkerProfile = input.role === 'walker' ? authService.buildWalkerProfile(apiUser.name) : null;
        const localUser = {
          ...apiUser,
          roles: input.role === 'walker' ? ['walker', 'owner'] : ['owner'],
          walkerProfileId: walkerProfile?.id ?? null,
        };
        commit((s) => ({
          ...s,
          users: [...s.users, localUser],
          walkers: walkerProfile
            ? [
                ...s.walkers,
                {
                  ...walkerProfile,
                  avatar: apiUser.avatar,
                  coords: localUser.address?.coords ?? walkerProfile.coords,
                  neighborhood: localUser.address?.neighborhood || walkerProfile.neighborhood,
                },
              ]
            : s.walkers,
          favorites: { ...s.favorites, [apiUser.id]: apiUser.favorites ?? [] },
        }));
        updateSession({ userId: apiUser.id, mode: input.role === 'walker' ? APP_MODES.WALKER : APP_MODES.OWNER });
        return localUser;
      },
      signOut() {
        updateSession({ ...DEFAULT_SESSION });
      },
      setMode(mode) {
        const user = currentUser();
        if (mode === APP_MODES.WALKER && user && !user.walkerProfileId) {
          // Tutor becoming a dog walker: create their own unlisted profile (onboarding)
          const profile = authService.buildWalkerProfile(user.name);
          commit((s) => ({
            ...s,
            walkers: [...s.walkers, { ...profile, avatar: user.avatar, coords: user.address?.coords ?? profile.coords, neighborhood: user.address?.neighborhood || profile.neighborhood }],
            users: s.users.map((u) => (u.id === user.id ? { ...u, roles: Array.from(new Set([...u.roles, 'walker'])), walkerProfileId: profile.id } : u)),
          }));
          const novoPerfil = dataRef.current.walkers.find((w) => w.id === profile.id);
          if (novoPerfil) catalogSync.upsertWalker(novoPerfil);
          sincronizarUsuario();
          updateSession({ mode });
          return;
        }
        if (mode === APP_MODES.OWNER && user && !user.roles.includes('owner')) {
          commit((s) => ({ ...s, users: s.users.map((u) => (u.id === user.id ? { ...u, roles: [...u.roles, 'owner'] } : u)) }));
          sincronizarUsuario();
        }
        updateSession({ mode });
      },
      updateUser(changes) {
        const userId = sessionRef.current.userId;
        commit((s) => ({ ...s, users: s.users.map((u) => (u.id === userId ? { ...u, ...changes } : u)) }));
        sincronizarUsuario();
      },

      // ---- bookings ----
      // Fase 4: o backend valida e persiste status/transições/pagamento/avaliação;
      // o front mantém o tracking simulado e as notificações locais.
      async createBooking(input) {
        // Validação local instantânea (mesmas mensagens do backend, com field)
        bookingService.validateBookingInput(dataRef.current, input);
        const booking = await bookingService.criarNaApi({ ...input, ownerId: sessionRef.current.userId });
        commit((s) => {
          let next = { ...s, bookings: [booking, ...s.bookings] };
          const context = {
            walker: next.walkers.find((w) => w.id === booking.walkerId),
            pet: next.pets.find((p) => p.id === booking.petId),
            owner: next.users.find((u) => u.id === booking.ownerId),
          };
          for (const n of bookingService.creationNotifications(booking, context)) {
            next = notificationService.notify(next, { ...n, userId: n.audience === 'owner' ? booking.ownerId : booking.walkerId });
          }
          return next;
        });
        return booking;
      },
      /** Aplica a transição validada no backend ao estado local */
      acceptBooking: (id) => transicionarRemoto(id, 'accepted', 'walker'),
      declineBooking: (id) => transicionarRemoto(id, 'declined', 'walker'),
      cancelBooking: (id, actor = 'owner') => transicionarRemoto(id, 'canceled', actor),
      transitionBooking: (bookingId, to, actor) => transicionarRemoto(bookingId, to, actor),
      payBooking: async (bookingId, methodId) => {
        const local = dataRef.current.bookings.find((b) => b.id === bookingId);
        const server = await bookingService.pagarNaApi(bookingId, methodId);
        commit((s) => bookingService.aplicarBookingRemoto(s, server, local, 'paid'));
        return server;
      },
      confirmPickup: async (bookingId, code) => {
        const local = dataRef.current.bookings.find((b) => b.id === bookingId);
        const server = await bookingService.confirmarRetiradaNaApi(bookingId, code);
        commit((s) => bookingService.aplicarBookingRemoto(s, server, local, 'picked_up'));
        return server;
      },
      reviewBooking: async (bookingId, rating, comment) => {
        const local = dataRef.current.bookings.find((b) => b.id === bookingId);
        const server = await bookingService.avaliarNaApi(bookingId, rating, comment);
        commit((s) => bookingService.aplicarBookingRemoto(s, server, local, 'reviewed'));
        return server;
      },
      updateTracking(bookingId, tracking) {
        commit((s) => ({ ...s, bookings: s.bookings.map((b) => (b.id === bookingId ? { ...b, tracking } : b)) }));
      },

      // ---- pets ----
      savePet: (pet) => {
        const saved = commit((s) => petService.savePet(s, sessionRef.current.userId, pet)).pet;
        if (saved) catalogSync.upsertPet(saved);
        return saved;
      },
      deletePet: (petId) => {
        commit((s) => petService.deletePet(s, petId));
        catalogSync.deletePetOnApi(petId);
      },

      // ---- favorites ----
      toggleFavorite: (walkerId) => {
        commit((s) => walkerService.toggleFavorite(s, sessionRef.current.userId, walkerId));
        catalogSync.toggleFavoriteOnApi(sessionRef.current.userId, walkerId);
      },

      // ---- messages ----
      openConversation(walkerId, ownerId) {
        return commit((s) => messageService.findOrCreateConversation(s, { ownerId: ownerId ?? sessionRef.current.userId, walkerId })).conversation;
      },
      sendMessage(conversationId, text) {
        const from = sessionRef.current.mode === APP_MODES.WALKER ? 'walker' : 'owner';
        const result = commit((s) => messageService.sendMessage(s, { conversationId, from, text }));
        // Simulated reply from the other side
        setTimeout(() => commit((s) => messageService.simulateReply(s, { conversationId, from: from === 'owner' ? 'walker' : 'owner' })), 2200);
        return result.message;
      },
      markConversationRead: (conversationId, side) => commit((s) => messageService.markConversationRead(s, conversationId, side)),

      // ---- payments ----
      addPaymentMethod: (input) => commit((s) => paymentService.addPaymentMethod(s, sessionRef.current.userId, input)).method,
      setDefaultPaymentMethod: (methodId) => commit((s) => paymentService.setDefaultPaymentMethod(s, sessionRef.current.userId, methodId)),
      removePaymentMethod: (methodId) => commit((s) => paymentService.removePaymentMethod(s, methodId)),

      // ---- walker profile & availability ----
      updateWalkerProfile: (changes) => {
        commit((s) => walkerService.updateWalkerProfile(s, myWalkerId(), changes));
        sincronizarWalker();
      },
      toggleSlot: (date, time) => {
        commit((s) => walkerService.toggleSlot(s, myWalkerId(), date, time));
        sincronizarWalker();
      },
      updateWeeklyAvailability: (weekday, slots) => {
        commit((s) => walkerService.updateWeeklyAvailability(s, myWalkerId(), weekday, slots));
        sincronizarWalker();
      },
      submitVerification: (kind) => {
        commit((s) => walkerService.submitVerification(s, myWalkerId(), kind));
        sincronizarWalker();
      },
      addReferral: (input) => commit((s) => walkerService.addReferral(s, { ...input, referrerId: sessionRef.current.userId })),
      submitWalkerApplication: (application) =>
        commit((s) => ({ ...s, walkerApplications: [{ ...application, id: `app${Date.now()}`, at: Date.now() }, ...s.walkerApplications] })),

      // ---- notifications ----
      markNotificationRead: (id) => commit((s) => notificationService.markRead(s, id)),
      markAllNotificationsRead(audience, userId) {
        commit((s) => notificationService.markAllRead(s, audience, userId));
      },
      pushNotification: (n) => commit((s) => notificationService.notify(s, n)),

      // ---- demo ----
      resetDemo() {
        removeKeys([STORAGE_KEY]);
        const fresh = createSeedState();
        dataRef.current = fresh;
        setData(fresh);
      },
      expireStaleBookings: () => commit((s) => bookingService.expireStaleBookings(s)),
    };
  }, [commit, updateSession, garantirUsuarioLocal]);

  // Conta da sessão que não existe no estado local (ex.: cadastro feito antes
  // de limpar o localStorage) volta a existir buscando na API.
  useEffect(() => {
    const userId = sessionRef.current.userId;
    if (!userId || dataRef.current.users.some((u) => u.id === userId)) return undefined;
    let cancelado = false;
    api
      .get(`/tutores/${userId}`)
      .then(({ data: user }) => {
        if (!cancelado) garantirUsuarioLocal(authService.normalizarUsuario(user));
      })
      .catch(() => {}); // API fora do ar: o app segue como visitante
    return () => {
      cancelado = true;
    };
  }, [garantirUsuarioLocal]);

  // Catálogo + passeios reais: walkers, pets e passeios vêm da API (Fases 3–4).
  // Itens que só existem localmente (ex.: perfil criado num cadastro recente)
  // são preservados; passeios hidratam com o tracking local quando o status coincide.
  useEffect(() => {
    let cancelado = false;
    Promise.all([api.get('/walkers'), api.get('/pets'), api.get('/passeios')])
      .then(([{ data: walkers }, { data: pets }, { data: passeios }]) => {
        if (cancelado) return;
        commit((s) => ({
          ...s,
          walkers: [...walkers, ...s.walkers.filter((w) => !walkers.some((apiWalker) => apiWalker.id === w.id))],
          pets: [...pets, ...s.pets.filter((p) => !pets.some((apiPet) => apiPet.id === p.id))],
          bookings: [
            ...passeios.map((p) => bookingService.mesclarHidratado(p, s.bookings.find((b) => b.id === p.id))),
            ...s.bookings.filter((b) => !passeios.some((p) => p.id === b.id)),
          ],
        }));
      })
      .catch(() => console.warn('[AppStore] API indisponível para hidratar os dados; usando dados locais.'));
    return () => {
      cancelado = true;
    };
  }, [commit]);

  // Expire stale requests on load and every minute
  useEffect(() => {
    actions.expireStaleBookings();
    const id = setInterval(actions.expireStaleBookings, 60000);
    return () => clearInterval(id);
  }, [actions]);

  return (
    <ActionsContext.Provider value={actions}>
      <SessionContext.Provider value={session}>
        <DataContext.Provider value={data}>{children}</DataContext.Provider>
      </SessionContext.Provider>
    </ActionsContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData precisa estar dentro de AppStoreProvider');
  return ctx;
}

export function useSession() {
  return useContext(SessionContext);
}

export function useActions() {
  return useContext(ActionsContext);
}
