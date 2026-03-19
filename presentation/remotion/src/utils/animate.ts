import { interpolate } from 'remotion';
import { appleEase } from '../data/tokens';

const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

/** Opacity fade 0→1 */
export function fadeIn(frame: number, delay = 0, duration = 20) {
  return interpolate(frame - delay, [0, duration], [0, 1], {
    easing: appleEase,
    ...CLAMP,
  });
}

/** Translate Y distance→0 */
export function slideUp(frame: number, delay = 0, distance = 24, duration = 25) {
  return interpolate(frame - delay, [0, duration], [distance, 0], {
    easing: appleEase,
    ...CLAMP,
  });
}

/** Translate X distance→0 */
export function slideRight(frame: number, delay = 0, distance = -24, duration = 25) {
  return interpolate(frame - delay, [0, duration], [distance, 0], {
    easing: appleEase,
    ...CLAMP,
  });
}

/** Scale 0.96→1 */
export function scaleIn(frame: number, delay = 0, duration = 20) {
  return interpolate(frame - delay, [0, duration], [0.96, 1], {
    easing: appleEase,
    ...CLAMP,
  });
}

/** Counter animation 0→target */
export function countUp(frame: number, target: number, delay = 0, duration = 30) {
  const progress = interpolate(frame - delay, [0, duration], [0, 1], {
    easing: appleEase,
    ...CLAMP,
  });
  return Math.round(target * progress);
}

/** Stagger delay calculator */
export function stagger(index: number, baseDelay = 0, interval = 5) {
  return baseDelay + index * interval;
}

/** Camera pan: slow drift from +range/2 to -range/2 */
export function cameraPan(frame: number, totalFrames: number, range = 60) {
  return interpolate(frame, [0, totalFrames], [range / 2, -range / 2], {
    easing: appleEase,
    ...CLAMP,
  });
}

/** Camera zoom: slow scale from 1.0 to 1.0+range */
export function cameraZoom(frame: number, totalFrames: number, range = 0.08) {
  return interpolate(frame, [0, totalFrames], [1.0, 1.0 + range], {
    easing: appleEase,
    ...CLAMP,
  });
}
