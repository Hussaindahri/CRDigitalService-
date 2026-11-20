import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type {
  LeadInquiry,
  OrderRecord,
  OrderStatus,
  PaymentRecord,
  PlatformId,
  ServiceItem,
  UserAccount,
  UserRole,
} from '../src/types/domain.ts';

export interface StoredUser extends UserAccount {
  passwordHash: string;
}

export interface DatabaseState {
  users: StoredUser[];
  services: ServiceItem[];
  orders: OrderRecord[];
  payments: PaymentRecord[];
  inquiries: LeadInquiry[];
  sessions: Record<string, string>;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function buildSeedState(): DatabaseState {
  const users: StoredUser[] = [
    {
      id: 'USR-1001',
      name: 'Maya Lin',
      email: 'client@crdigital.io',
      company: 'Northstar Media Studio',
      role: 'client',
      balance: 420.5,
      totalSpent: 1284.75,
      status: 'Active',
      createdAt: '2026-09-14T10:15:00.000Z',
      passwordHash: hashPassword('client123'),
    },
    {
      id: 'USR-1002',
      name: 'Alex Rivera',
      email: 'admin@crdigital.io',
      company: 'CR Digital Operations',
      role: 'admin',
      balance: 2500.0,
      totalSpent: 0,
      status: 'Active',
      createdAt: '2026-08-01T09:00:00.000Z',
      passwordHash: hashPassword('admin123'),
    },
    {
      id: 'USR-1003',
      name: 'Daniel Brooks',
      email: 'daniel@vervecommerce.com',
      company: 'Verve Commerce Group',
      role: 'client',
      balance: 185.0,
      totalSpent: 640.0,
      status: 'Active',
      createdAt: '2026-10-03T14:22:00.000Z',
      passwordHash: hashPassword('verve123'),
    },
  ];

  const services: ServiceItem[] = [
    // YouTube
    {
      id: 'YT-101',
      platform: 'youtube',
      name: 'YouTube High-Retention Views (3–5 Min Avg)',
      category: 'Views',
      ratePer1k: 3.4,
      minOrder: 500,
      maxOrder: 500000,
      startTime: '0–2 hrs',
      speed: '10K/day',
      retention: '30-day refill',
      description: 'Organic search & suggested discovery traffic engineered for steady watch-duration curves.',
      active: true,
    },
    {
      id: 'YT-102',
      platform: 'youtube',
      name: 'YouTube Channel Subscribers (Steady Drip)',
      category: 'Subscribers',
      ratePer1k: 24.0,
      minOrder: 100,
      maxOrder: 25000,
      startTime: '2–6 hrs',
      speed: '400/day',
      retention: '60-day refill',
      description: 'Gradual daily subscriber pacing suited for brand channels and monetization thresholds.',
      active: true,
    },
    {
      id: 'YT-103',
      platform: 'youtube',
      name: 'YouTube 4,000 Watch Hours Package (Long-Form)',
      category: 'Watch Time',
      ratePer1k: 18.5,
      minOrder: 1000,
      maxOrder: 10000,
      startTime: '6–12 hrs',
      speed: '500 hrs/day',
      retention: '30-day refill',
      description: 'Requires public video 60+ minutes long. Optimized for monetization watch-hour audits.',
      active: true,
    },
    {
      id: 'YT-104',
      platform: 'youtube',
      name: 'YouTube Shorts Reach & Likes Bundle',
      category: 'Shorts',
      ratePer1k: 2.15,
      minOrder: 1000,
      maxOrder: 1000000,
      startTime: '0–1 hr',
      speed: '50K/day',
      retention: 'No-drop guarantee',
      description: 'Fast vertical feed momentum for Shorts launches and episodic creator reels.',
      active: true,
    },

    // TikTok
    {
      id: 'TT-201',
      platform: 'tiktok',
      name: 'TikTok For-You Video Views',
      category: 'Views',
      ratePer1k: 0.45,
      minOrder: 1000,
      maxOrder: 5000000,
      startTime: '0–30 min',
      speed: '250K/day',
      retention: 'Lifetime stability',
      description: 'Immediate video view velocity for product clips, creator challenges, and sound seeding.',
      active: true,
    },
    {
      id: 'TT-202',
      platform: 'tiktok',
      name: 'TikTok Profile Followers (Verified Tier)',
      category: 'Followers',
      ratePer1k: 7.8,
      minOrder: 250,
      maxOrder: 100000,
      startTime: '1–3 hrs',
      speed: '5K/day',
      retention: '30-day refill',
      description: 'Active-profile followers with avatars and bio activity for brand credibility.',
      active: true,
    },
    {
      id: 'TT-203',
      platform: 'tiktok',
      name: 'TikTok Saves, Shares & Engagement Pack',
      category: 'Engagement',
      ratePer1k: 3.2,
      minOrder: 500,
      maxOrder: 200000,
      startTime: '0–1 hr',
      speed: '15K/day',
      retention: '30-day refill',
      description: 'Balanced bookmark saves and share signals designed to support algorithmic distribution.',
      active: true,
    },
    {
      id: 'TT-204',
      platform: 'tiktok',
      name: 'TikTok Live Stream Concurrent Viewers (30 Min)',
      category: 'Live',
      ratePer1k: 14.5,
      minOrder: 100,
      maxOrder: 10000,
      startTime: 'Instant',
      speed: 'Live',
      retention: 'Session-locked',
      description: 'Sustained concurrent viewers for TikTok Shop broadcasts and creator Q&A sessions.',
      active: true,
    },

    // Instagram
    {
      id: 'IG-301',
      platform: 'instagram',
      name: 'Instagram Global Brand Followers (HQ)',
      category: 'Followers',
      ratePer1k: 5.9,
      minOrder: 250,
      maxOrder: 250000,
      startTime: '0–2 hrs',
      speed: '8K/day',
      retention: '30-day refill',
      description: 'Profile-aged followers with natural delivery cadence for creator and storefront accounts.',
      active: true,
    },
    {
      id: 'IG-302',
      platform: 'instagram',
      name: 'Instagram Reels Plays & Reach Insights',
      category: 'Reels',
      ratePer1k: 0.95,
      minOrder: 1000,
      maxOrder: 2000000,
      startTime: '0–30 min',
      speed: '150K/day',
      retention: 'No-drop guarantee',
      description: 'High-volume Reels plays paired with discovery reach metrics inside Professional Dashboard.',
      active: true,
    },
    {
      id: 'IG-303',
      platform: 'instagram',
      name: 'Instagram Carousel Saves & Post Likes',
      category: 'Engagement',
      ratePer1k: 2.8,
      minOrder: 250,
      maxOrder: 100000,
      startTime: '0–1 hr',
      speed: '12K/day',
      retention: '30-day refill',
      description: 'Combined post likes and collection saves tailored for educational carousels and drops.',
      active: true,
    },
    {
      id: 'IG-304',
      platform: 'instagram',
      name: 'Instagram Story Views (Full Sequence)',
      category: 'Stories',
      ratePer1k: 1.6,
      minOrder: 500,
      maxOrder: 100000,
      startTime: '0–30 min',
      speed: '40K/day',
      retention: '24h cycle',
      description: 'Views distributed sequentially across all active 24-hour story frames.',
      active: true,
    },

    // Telegram
    {
      id: 'TG-401',
      platform: 'telegram',
      name: 'Telegram Channel Subscribers (Non-Drop)',
      category: 'Members',
      ratePer1k: 6.5,
      minOrder: 250,
      maxOrder: 200000,
      startTime: '0–2 hrs',
      speed: '10K/day',
      retention: '60-day refill',
      description: 'Public channel subscriber expansion with low churn for media outlets and communities.',
      active: true,
    },
    {
      id: 'TG-402',
      platform: 'telegram',
      name: 'Telegram Last 10 Posts Auto-Views',
      category: 'Post Views',
      ratePer1k: 0.85,
      minOrder: 1000,
      maxOrder: 1000000,
      startTime: 'Instant',
      speed: '100K/day',
      retention: 'Permanent',
      description: 'Retroactive view balancing across your latest 10 channel broadcasts.',
      active: true,
    },
    {
      id: 'TG-403',
      platform: 'telegram',
      name: 'Telegram Positive Emoji Reactions',
      category: 'Reactions',
      ratePer1k: 1.9,
      minOrder: 200,
      maxOrder: 100000,
      startTime: '0–30 min',
      speed: '25K/day',
      retention: 'Permanent',
      description: 'Natural mix of thumbs-up, fire, and heart reactions on targeted announcements.',
      active: true,
    },

    // Facebook
    {
      id: 'FB-501',
      platform: 'facebook',
      name: 'Facebook Business Page Likes & Followers',
      category: 'Page Growth',
      ratePer1k: 7.4,
      minOrder: 250,
      maxOrder: 150000,
      startTime: '1–4 hrs',
      speed: '5K/day',
      retention: '30-day refill',
      description: 'Simultaneous page likes and followers for local businesses and e-commerce brands.',
      active: true,
    },
    {
      id: 'FB-502',
      platform: 'facebook',
      name: 'Facebook Reels & Video 3-Second Views',
      category: 'Video Views',
      ratePer1k: 1.35,
      minOrder: 1000,
      maxOrder: 1000000,
      startTime: '0–1 hr',
      speed: '80K/day',
      retention: 'No-drop guarantee',
      description: 'View distribution optimized for Facebook Reels and product demonstration videos.',
      active: true,
    },
    {
      id: 'FB-503',
      platform: 'facebook',
      name: 'Facebook Post Reactions & Shares',
      category: 'Engagement',
      ratePer1k: 4.5,
      minOrder: 100,
      maxOrder: 50000,
      startTime: '0–2 hrs',
      speed: '3K/day',
      retention: '30-day refill',
      description: 'Targeted post interactions to increase social proof on sponsored and organic posts.',
      active: true,
    },

    // LinkedIn
    {
      id: 'LI-601',
      platform: 'linkedin',
      name: 'LinkedIn Company Page Followers',
      category: 'Company Growth',
      ratePer1k: 26.0,
      minOrder: 100,
      maxOrder: 25000,
      startTime: '4–12 hrs',
      speed: '350/day',
      retention: '30-day refill',
      description: 'Professional corporate profile followers to strengthen B2B brand authority.',
      active: true,
    },
    {
      id: 'LI-602',
      platform: 'linkedin',
      name: 'LinkedIn Executive Post Impressions & Likes',
      category: 'Engagement',
      ratePer1k: 18.0,
      minOrder: 100,
      maxOrder: 20000,
      startTime: '1–4 hrs',
      speed: '1K/day',
      retention: '30-day refill',
      description: 'Early-window reaction support for founder thought-leadership articles and releases.',
      active: true,
    },
    {
      id: 'LI-603',
      platform: 'linkedin',
      name: 'LinkedIn Personal Profile Followers',
      category: 'Profile',
      ratePer1k: 22.0,
      minOrder: 100,
      maxOrder: 15000,
      startTime: '4–8 hrs',
      speed: '300/day',
      retention: '30-day refill',
      description: 'Steady follower acquisition for creator mode profiles and executive speakers.',
      active: true,
    },

    // Pinterest
    {
      id: 'PI-701',
      platform: 'pinterest',
      name: 'Pinterest Board & Profile Followers',
      category: 'Followers',
      ratePer1k: 8.9,
      minOrder: 200,
      maxOrder: 50000,
      startTime: '2–6 hrs',
      speed: '2K/day',
      retention: '30-day refill',
      description: 'Visual discovery followers ideal for interior design, fashion, and retail catalogs.',
      active: true,
    },
    {
      id: 'PI-702',
      platform: 'pinterest',
      name: 'Pinterest Pin Saves & Repins',
      category: 'Repins',
      ratePer1k: 6.2,
      minOrder: 250,
      maxOrder: 100000,
      startTime: '1–3 hrs',
      speed: '4K/day',
      retention: 'Permanent',
      description: 'Increases pin index longevity and seasonal shopping board placement.',
      active: true,
    },
    {
      id: 'PI-703',
      platform: 'pinterest',
      name: 'Pinterest Idea Pin Impressions',
      category: 'Impressions',
      ratePer1k: 2.1,
      minOrder: 1000,
      maxOrder: 500000,
      startTime: '0–2 hrs',
      speed: '30K/day',
      retention: 'No-drop guarantee',
      description: 'High-volume top-of-funnel impressions for multi-frame Idea Pins.',
      active: true,
    },

    // Snapchat
    {
      id: 'SC-801',
      platform: 'snapchat',
      name: 'Snapchat Public Profile Subscribers',
      category: 'Subscribers',
      ratePer1k: 19.5,
      minOrder: 100,
      maxOrder: 30000,
      startTime: '2–8 hrs',
      speed: '600/day',
      retention: '30-day refill',
      description: 'Grows public creator and brand profile subscriber counts for Discover eligibility.',
      active: true,
    },
    {
      id: 'SC-802',
      platform: 'snapchat',
      name: 'Snapchat Spotlight Video Views',
      category: 'Spotlight',
      ratePer1k: 2.4,
      minOrder: 1000,
      maxOrder: 500000,
      startTime: '0–2 hrs',
      speed: '35K/day',
      retention: 'No-drop guarantee',
      description: 'Consistent Spotlight clip views supporting regional feed distribution.',
      active: true,
    },
    {
      id: 'SC-803',
      platform: 'snapchat',
      name: 'Snapchat Story Views & Engagement',
      category: 'Stories',
      ratePer1k: 3.1,
      minOrder: 500,
      maxOrder: 100000,
      startTime: '0–1 hr',
      speed: '20K/day',
      retention: '24h cycle',
      description: 'Boosts public story completion metrics during product drops and live events.',
      active: true,
    },
  ];

  const orders: OrderRecord[] = [
    {
      id: 'ORD-8842',
      userId: 'USR-1001',
      userName: 'Maya Lin',
      userEmail: 'client@crdigital.io',
      serviceId: 'YT-101',
      serviceName: 'YouTube High-Retention Views (3–5 Min Avg)',
      platform: 'youtube',
      targetUrl: 'https://youtube.com/watch?v=northstar-q4-launch',
      quantity: 25000,
      delivered: 25000,
      charge: 85.0,
      status: 'Completed',
      createdAt: '2026-11-17T14:10:00.000Z',
    },
    {
      id: 'ORD-8849',
      userId: 'USR-1001',
      userName: 'Maya Lin',
      userEmail: 'client@crdigital.io',
      serviceId: 'IG-302',
      serviceName: 'Instagram Reels Plays & Reach Insights',
      platform: 'instagram',
      targetUrl: 'https://instagram.com/reel/C8xK2pL9a1Q',
      quantity: 50000,
      delivered: 34200,
      charge: 47.5,
      status: 'In Progress',
      createdAt: '2026-11-19T09:42:00.000Z',
    },
    {
      id: 'ORD-8854',
      userId: 'USR-1001',
      userName: 'Maya Lin',
      userEmail: 'client@crdigital.io',
      serviceId: 'LI-601',
      serviceName: 'LinkedIn Company Page Followers',
      platform: 'linkedin',
      targetUrl: 'https://linkedin.com/company/northstar-media-studio',
      quantity: 500,
      delivered: 0,
      charge: 13.0,
      status: 'Pending',
      createdAt: '2026-11-20T03:18:00.000Z',
    },
    {
      id: 'ORD-8851',
      userId: 'USR-1003',
      userName: 'Daniel Brooks',
      userEmail: 'daniel@vervecommerce.com',
      serviceId: 'TT-201',
      serviceName: 'TikTok For-You Video Views',
      platform: 'tiktok',
      targetUrl: 'https://tiktok.com/@vervehome/video/741928371',
      quantity: 100000,
      delivered: 68500,
      charge: 45.0,
      status: 'In Progress',
      createdAt: '2026-11-19T18:05:00.000Z',
    },
    {
      id: 'ORD-8840',
      userId: 'USR-1003',
      userName: 'Daniel Brooks',
      userEmail: 'daniel@vervecommerce.com',
      serviceId: 'PI-702',
      serviceName: 'Pinterest Pin Saves & Repins',
      platform: 'pinterest',
      targetUrl: 'https://pinterest.com/pin/49281749210/',
      quantity: 4000,
      delivered: 4000,
      charge: 24.8,
      status: 'Completed',
      createdAt: '2026-11-16T11:30:00.000Z',
    },
  ];

  const payments: PaymentRecord[] = [
    {
      id: 'PAY-4401',
      userId: 'USR-1001',
      userName: 'Maya Lin',
      userEmail: 'client@crdigital.io',
      method: 'Card (Stripe)',
      reference: 'ch_3Q9xK2L81mN',
      amount: 500.0,
      type: 'Deposit',
      status: 'Approved',
      createdAt: '2026-11-15T08:00:00.000Z',
    },
    {
      id: 'PAY-4402',
      userId: 'USR-1001',
      userName: 'Maya Lin',
      userEmail: 'client@crdigital.io',
      method: 'Wallet Debit',
      reference: 'ORD-8842',
      amount: -85.0,
      type: 'Order Debit',
      status: 'Approved',
      createdAt: '2026-11-17T14:10:00.000Z',
    },
    {
      id: 'PAY-4403',
      userId: 'USR-1001',
      userName: 'Maya Lin',
      userEmail: 'client@crdigital.io',
      method: 'USDT (TRC-20)',
      reference: 'tx_9182bc77e410',
      amount: 250.0,
      type: 'Deposit',
      status: 'Pending',
      createdAt: '2026-11-20T04:10:00.000Z',
    },
    {
      id: 'PAY-4404',
      userId: 'USR-1003',
      userName: 'Daniel Brooks',
      userEmail: 'daniel@vervecommerce.com',
      method: 'Wire / ACH',
      reference: 'ACH-771920',
      amount: 300.0,
      type: 'Deposit',
      status: 'Pending',
      createdAt: '2026-11-20T02:45:00.000Z',
    },
  ];

  const inquiries: LeadInquiry[] = [];

  return {
    users,
    services,
    orders,
    payments,
    inquiries,
    sessions: {},
  };
}

let cachedState: DatabaseState | null = null;

export function getDb(): DatabaseState {
  if (cachedState) {
    return cachedState;
  }
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      cachedState = JSON.parse(raw) as DatabaseState;
      return cachedState;
    } catch {
      // Fall back to fresh seed if corrupted
    }
  }
  cachedState = buildSeedState();
  saveDb();
  return cachedState;
}

export function saveDb(): void {
  if (!cachedState) return;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(cachedState, null, 2), 'utf-8');
}

export function sanitizeUser(user: StoredUser): UserAccount {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    company: user.company,
    role: user.role,
    balance: Number(user.balance.toFixed(2)),
    totalSpent: Number(user.totalSpent.toFixed(2)),
    status: user.status,
    createdAt: user.createdAt,
  };
}

export function createSessionToken(userId: string): string {
  const db = getDb();
  const token = crypto.randomBytes(24).toString('hex');
  db.sessions[token] = userId;
  saveDb();
  return token;
}

export function getUserFromToken(token: string | undefined): StoredUser | null {
  if (!token) return null;
  const db = getDb();
  const userId = db.sessions[token];
  if (!userId) return null;
  return db.users.find((u) => u.id === userId) ?? null;
}

export function nextId(prefix: string, items: Array<{ id: string }>): string {
  let maxNum = 1000;
  for (const item of items) {
    const parts = item.id.split('-');
    const parsed = Number.parseInt(parts[parts.length - 1] ?? '', 10);
    if (!Number.isNaN(parsed) && parsed > maxNum) {
      maxNum = parsed;
    }
  }
  return `${prefix}-${maxNum + 1}`;
}

export function isValidPlatform(platform: string): platform is PlatformId {
  return [
    'youtube',
    'tiktok',
    'instagram',
    'telegram',
    'facebook',
    'linkedin',
    'pinterest',
    'snapchat',
  ].includes(platform);
}

export function isValidOrderStatus(status: string): status is OrderStatus {
  return ['Pending', 'In Progress', 'Completed', 'Partial', 'Cancelled'].includes(status);
}

export function isValidRole(role: string): role is UserRole {
  return role === 'client' || role === 'admin';
}
