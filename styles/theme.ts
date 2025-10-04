// スペース
const spacing = [2, 4, 8, 16, 24, 32, 64, 128, 256, 512];

// 色
const colors = {
  primary: "#72D2FF",
  secondary: "#42A9E6",
  error: "#E53935",
  warn: "#FFB900",
  white: "#FFFFFF",
  black: "#000000",
  dark: "#002333",
  background: {
    dark: "#E4E4E4",
    light: "#FFFFFF",
    lightGray: "#FAFAFA",
  },
  lightGray: "#e0e0e0",
  font: {
    black: "#000000",
    gray: "#777777",
  },
  parts: {
    1: "#FF9F71",
    2: "#FF71D1",
    3: "#D2FF71",
    4: "#8BFF71",
    5: "#9F71FF",
    6: "#718BFF",
    7: "#FFE571",
  },
  border: {
    light: "#E0E0E0",
    dark: "#B0B0B0",
  },
};

// 文字サイズ
const fontSizes = {
  small: 12,
  medium: 16,
  large: 20,
};

const fontSize = {
  xxs: 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
};

const theme = {
  colors,
  fontSizes,
  spacing,
  fontSize,
};

export default theme;
