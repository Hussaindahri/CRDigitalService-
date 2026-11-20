import type { PlatformId, PlatformMeta } from '../types/domain';

export const PLATFORMS: PlatformMeta[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    path: '/youtube',
    headline: 'Long-form retention, Shorts velocity, and monetization watch hours',
    summary:
      'Calibrated viewer retention curves, steady subscriber pacing, and 4,000-hour audit packages built for creator channels and media brands.',
    targetPlaceholder: 'https://youtube.com/watch?v=...',
    deliveryGuidance:
      'Ensure videos are set to Public with embedding enabled before submitting watch-time or high-retention orders.',
    accentHex: '#DC2626',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    path: '/tiktok',
    headline: 'For-You feed momentum, saves, and live broadcast concurrency',
    summary:
      'Rapid view seeding, bookmark saves, profile follower growth, and sustained live stream viewer support for TikTok Shop and creator launches.',
    targetPlaceholder: 'https://tiktok.com/@brand/video/...',
    deliveryGuidance:
      'Video links must remain public throughout delivery; avoid switching accounts to private mid-campaign.',
    accentHex: '#0F172A',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    path: '/instagram',
    headline: 'Reels distribution, carousel saves, and profile credibility',
    summary:
      'Targeted Reels plays, collection-save engagement, sequential Story views, and aged follower acquisition for storefronts and creators.',
    targetPlaceholder: 'https://instagram.com/reel/...',
    deliveryGuidance:
      'Turn off country/age restrictions and keep the target handle public so insight metrics track cleanly.',
    accentHex: '#BE185D',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    path: '/telegram',
    headline: 'Channel subscriber retention, post auto-views, and reactions',
    summary:
      'Non-drop public channel members, retroactive broadcast view balancing, and natural emoji reactions for newsrooms and communities.',
    targetPlaceholder: 'https://t.me/channelname',
    deliveryGuidance:
      'Public channel username links (@handle or t.me/handle) are required for subscriber and post-view indexing.',
    accentHex: '#0284C7',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    path: '/facebook',
    headline: 'Business page authority, Reels reach, and post social proof',
    summary:
      'Unified Page Likes and Followers, 3-second Reels video reach, and balanced post reactions for regional businesses and commerce teams.',
    targetPlaceholder: 'https://facebook.com/yourpage',
    deliveryGuidance:
      'Verify that the Page is published and visible globally without demographic lockouts.',
    accentHex: '#1D4ED8',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    path: '/linkedin',
    headline: 'Executive thought-leadership reach and B2B company followers',
    summary:
      'Measured daily follower pacing for company pages and early-window post engagement for founder announcements and hiring campaigns.',
    targetPlaceholder: 'https://linkedin.com/company/...',
    deliveryGuidance:
      'Company page growth operates on conservative daily caps (300–350/day) to preserve organic feed trust.',
    accentHex: '#0369A1',
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    path: '/pinterest',
    headline: 'Visual discovery repins, board followers, and Idea Pin reach',
    summary:
      'Seasonal repin velocity and board subscriber growth tailored for home decor, apparel, and editorial commerce catalogs.',
    targetPlaceholder: 'https://pinterest.com/pin/...',
    deliveryGuidance:
      'Submit direct Pin URLs for repins or top-level profile URLs for board and account follower packages.',
    accentHex: '#B91C1C',
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    path: '/snapchat',
    headline: 'Public profile subscribers, Spotlight views, and Story completion',
    summary:
      'Steady public creator subscriber growth and Spotlight clip distribution engineered for youth-oriented media drops.',
    targetPlaceholder: 'https://snapchat.com/add/username',
    deliveryGuidance:
      'Public Profile must be enabled in Snapchat settings before submitting Spotlight or Subscriber orders.',
    accentHex: '#CA8A04',
  },
];

export const PLATFORM_MAP: Record<PlatformId, PlatformMeta> = PLATFORMS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<PlatformId, PlatformMeta>
);

export function normalizeRoutePath(pathname: string): string {
  const clean = pathname.replace(/\.html$/i, '').replace(/\/+$/, '');
  if (!clean || clean === '/index') return '/';
  return clean;
}
