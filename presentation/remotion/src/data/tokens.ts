import { Easing } from 'remotion';

// Apple-style light theme design tokens
export const colors = {
  // Brand accent (single accent, like Apple's blue)
  primary: '#FF6B00',
  primaryLight: '#FFF4EB',
  primaryHover: '#E55F00',
  primaryMuted: 'rgba(255, 107, 0, 0.06)',

  // Backgrounds — white/light
  bg: '#FFFFFF',
  bgSurface: '#F5F5F7',
  bgCard: '#FFFFFF',
  bgCardHover: '#FAFAFA',
  bgAccent: 'rgba(255, 107, 0, 0.04)',

  // Text — dark on light
  text: '#1D1D1F',
  textSecondary: '#86868B',
  textMuted: '#8E8E93',
  textDim: '#AEAEB2',

  // Borders — Apple-subtle
  border: 'rgba(0, 0, 0, 0.08)',
  borderLight: 'rgba(0, 0, 0, 0.04)',

  // Semantic (muted for light theme)
  green: '#34C759',
  blue: '#007AFF',
  purple: '#AF52DE',
  cyan: '#32ADE6',
  pink: '#FF2D55',
  yellow: '#FF9500',
  red: '#FF3B30',

  // Score gradient
  score1: '#FDBA74',
  score2: '#FB923C',
  score3: '#F97316',
  score4: '#EA580C',
  score5: '#C2410C',
} as const;

export const fonts = {
  main: '"Helvetica Neue", Helvetica, Arial, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  mono: '"JetBrains Mono", "Fira Code", "SF Mono", monospace',
} as const;

export const spacing = {
  pagePaddingX: 80,
  pagePaddingY: 80,
  sectionGap: 40,
  cardRadius: 20,
  cardRadiusSm: 14,
  cardBorder: 'transparent',
  cardShadow: 'none',
  cardShadowSm: 'none',
} as const;

// Camera motion config — perceptible Ken Burns effect
export const camera = {
  panRange: 60,
  zoomRange: 0.08,
} as const;

export const typography = {
  coverTitle: { size: 64, weight: 700, letterSpacing: -1.3 },
  sectionLabel: { size: 15, weight: 600, letterSpacing: 2 },
  sectionHeader: { size: 44, weight: 700, letterSpacing: -0.5 },
  body: { size: 17, weight: 400, lineHeight: 1.65 },
  caption: { size: 14, weight: 500 },
  label: { size: 12, weight: 600 },
} as const;

// Apple-style easing: cubic-bezier(0.16, 1, 0.3, 1)
export const appleEase = Easing.bezier(0.16, 1, 0.3, 1);

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
