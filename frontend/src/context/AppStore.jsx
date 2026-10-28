import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createSeedState, SEED_VERSION } from '../data/mock';
import { STORAGE_KEY, SESSION_KEY, APP_MODES } from '../utils/constants';
import { loadJSON, saveJSON, removeKeys } from '../utils/storage';
import * as bookingService from '../services/bookingService';
import * as authService from '../services/authService';
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

  const actions = useMemo(() => {
    const currentUser = () => dataRef.current.users.find((u) => u.id === sessionRef.current.userId);
    // The walker profile always belongs to the signed-in account
    const myWalkerId = () => currentUser()?.walkerProfileId;
    /** Mode to start in: the requested one if the account has that role, else its primary role */
    const startMode = (user, preferred) => {
      if (preferred === APP_MODES.WALKER && user.walkerProfileId) return APP_MODES.WALKER;
      if (preferred === APP_MODES.OWNER && user.roles.includes('owner')) return APP_MODES.OWNER;
      return user.roles[0] === 'walker' ? APP_MODES.WALKER : APP_MODES.OWNER;
    };

    return {
      commit,
      // ---- auth & session ----
      signIn(credentials, preferredMode) {
        const user = authService.signIn(dataRef.current, credentials);
        updateSession({ userId: user.id, mode: startMode(user, preferredMode) });
        return user;
      },
      /** Demo shortcut: sign in to a known account without typing credentials */
      signInAs(userId, preferredMode) {
        const user = dataRef.current.users.find((u) => u.id === userId);
        if (!user) return null;
        updateSession({ userId, mode: startMode(user, preferredMode) });
        return user;
      },
      signUp(input) {
        const { user } = commit((s) => authService.signUp(s, input));
        updateSession({ userId: user.id, mode: input.role === 'walker' ? APP_MODES.WALKER : APP_MODES.OWNER });
        return user;
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
          updateSession({ mode });
          return;
        }
        if (mode === APP_MODES.OWNER && user && !user.roles.includes('owner')) {
          commit((s) => ({ ...s, users: s.users.map((u) => (u.id === user.id ? { ...u, roles: [...u.roles, 'owner'] } : u)) }));
        }
        updateSession({ mode });
      },
      updateUser(changes) {
        const userId = sessionRef.current.userId;
        commit((s) => ({ ...s, users: s.users.map((u) => (u.id === userId ? { ...u, ...changes } : u)) }));
      },

      // ---- bookings ----
      createBooking(input) {
        return commit((s) => bookingService.createBooking(s, { ...input, ownerId: sessionRef.current.userId })).booking;
      },
      acceptBooking: (id) => commit((s) => bookingService.acceptBooking(s, id)).booking,
      declineBooking: (id) => commit((s) => bookingService.declineBooking(s, id)).booking,
      cancelBooking: (id, actor) => commit((s) => bookingService.cancelBooking(s, id, actor)).booking,
      payBooking: (bookingId, methodId) => commit((s) => bookingService.payBooking(s, { bookingId, methodId })).booking,
      confirmPickup: (bookingId, code) => commit((s) => bookingService.confirmPickup(s, { bookingId, code })).booking,
      transitionBooking: (bookingId, to, actor) => commit((s) => bookingService.transitionBooking(s, { bookingId, to, actor })).booking,
      reviewBooking: (bookingId, rating, comment) => commit((s) => bookingService.reviewBooking(s, { bookingId, rating, comment })).booking,
      updateTracking(bookingId, tracking) {
        commit((s) => ({ ...s, bookings: s.bookings.map((b) => (b.id === bookingId ? { ...b, tracking } : b)) }));
      },

      // ---- pets ----
      savePet: (pet) => commit((s) => petService.savePet(s, sessionRef.current.userId, pet)).pet,
      deletePet: (petId) => commit((s) => petService.deletePet(s, petId)),

      // ---- favorites ----
      toggleFavorite: (walkerId) => commit((s) => walkerService.toggleFavorite(s, sessionRef.current.userId, walkerId)),

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
      updateWalkerProfile: (changes) => commit((s) => walkerService.updateWalkerProfile(s, myWalkerId(), changes)),
      toggleSlot: (date, time) => commit((s) => walkerService.toggleSlot(s, myWalkerId(), date, time)),
      updateWeeklyAvailability: (weekday, slots) => commit((s) => walkerService.updateWeeklyAvailability(s, myWalkerId(), weekday, slots)),
      submitVerification: (kind) => commit((s) => walkerService.submitVerification(s, myWalkerId(), kind)),
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
  }, [commit, updateSession]);

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
