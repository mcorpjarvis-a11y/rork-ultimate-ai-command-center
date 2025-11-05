const ironManRed = '#C1272D';
const ironManGold = '#FFD700';
const arcReactorBlue = '#00E5FF';
const jarvisGreen = '#7CFC00';
const darkRed = '#8B0000';
const deepGold = '#B8860B';

export const IronManTheme = {
  primary: ironManRed,
  secondary: ironManGold,
  accent: arcReactorBlue,
  arcReactorBlue,
  jarvisGreen,
  background: '#000000',
  surface: '#0a0a0a',
  surfaceLight: '#1a1a1a',
  cardBackground: '#0d0d0d',
  cardBorder: 'rgba(193, 39, 45, 0.3)',
  text: '#ffffff',
  textPrimary: '#ffffff',
  textSecondary: '#cccccc',
  textMuted: '#888888',
  success: jarvisGreen,
  warning: ironManGold,
  danger: '#FF3B30',
  error: '#FF3B30',
  border: '#1a1a1a',
  borderLight: 'rgba(193, 39, 45, 0.2)',
  borderActive: ironManGold,
  borderGlow: ironManRed,
  gradient: {
    redGold: [ironManRed, ironManGold],
    darkRed: [darkRed, ironManRed],
    gold: [deepGold, ironManGold],
    blue: ['#003d5c', arcReactorBlue],
    green: ['#1a3a1a', jarvisGreen],
  },
  glow: {
    red: 'rgba(193, 39, 45, 0.4)',
    redStrong: 'rgba(193, 39, 45, 0.8)',
    gold: 'rgba(255, 215, 0, 0.4)',
    goldStrong: 'rgba(255, 215, 0, 0.8)',
    blue: 'rgba(0, 229, 255, 0.4)',
    blueStrong: 'rgba(0, 229, 255, 0.8)',
    green: 'rgba(124, 252, 0, 0.4)',
    greenStrong: 'rgba(124, 252, 0, 0.8)',
  },
  shadow: {
    red: {
      shadowColor: ironManRed,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 8,
    },
    gold: {
      shadowColor: ironManGold,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 8,
    },
    blue: {
      shadowColor: arcReactorBlue,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 8,
    },
    green: {
      shadowColor: jarvisGreen,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 8,
    },
  },
};

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: ironManRed,
    tabIconDefault: '#ccc',
    tabIconSelected: ironManRed,
  },
  dark: IronManTheme,
};
