import { Easing } from "remotion";

export const THEME = {
  colors: {
    background: "#fafafa",
    surface: "#ffffff",
    charcoal: "#111111",
    primary: "#e8590c",
    primaryLight: "#fff4ed",
    border: "#eaeaea",
    muted: "#71717a",
    subtle: "#a1a1aa",
    green: "#346538",
    greenLight: "#edf3ec",
    whatsapp: "#25D366",
    whatsappBg: "#EFEAE2",
  },
  easing: {
    easeOut: Easing.bezier(0.16, 1, 0.3, 1),
    easeInOut: Easing.bezier(0.65, 0, 0.35, 1),
    pop: Easing.bezier(0.34, 1.56, 0.64, 1),
    easeIn: Easing.bezier(0.7, 0, 0.84, 0),
  },
  typography: {
    heading: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'Geist Mono', 'SF Mono', monospace",
  },
};
