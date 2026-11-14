import type { RatioId } from '../lib/types';

export const RATIOS: Record<RatioId, { w: number; h: number; label: string; hint: string }> = {
  '1:1': { w: 1080, h: 1080, label: '1:1', hint: 'Feed' },
  '4:5': { w: 1080, h: 1350, label: '4:5', hint: 'Instagram' },
  '9:16': { w: 1080, h: 1920, label: '9:16', hint: 'Stories / Reels' },
};
