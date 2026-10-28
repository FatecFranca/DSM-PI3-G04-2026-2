import { mockWalkers } from './walkers';
import { mockUsers } from './users';
import { mockPets } from './pets';
import { mockBookings } from './bookings';
import { mockReviews } from './reviews';
import { mockConversations } from './conversations';
import { mockNotifications } from './notifications';
import { mockPaymentMethods } from './paymentMethods';

export const SEED_VERSION = 5;

/** Fresh copy of the whole demo dataset. Consumed by the store on first load or reset. */
export function createSeedState() {
  return structuredClone({
    version: SEED_VERSION,
    seededAt: Date.now(),
    users: mockUsers,
    walkers: mockWalkers,
    pets: mockPets,
    bookings: mockBookings,
    reviews: mockReviews,
    conversations: mockConversations,
    notifications: mockNotifications,
    paymentMethods: mockPaymentMethods,
    favorites: { u1: ['w1', 'w4', 'w10'], u2: ['w1'], u3: [], u4: ['w3'] },
    referrals: [],
    walkerApplications: [],
  });
}
