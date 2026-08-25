export const STATUS_COLORS = {
  PURPLE: '#C26EE9',
  PINK: '#EE5FAB',
  YELLOW: '#E3CC00',
  ORANGE: '#F19100',
  GREEN: '#04CD25',
  DARK_GREEN: '#109121',
  GRAY: '#C6C6C6',
  RED: '#FF3636',
  BLUE: '#6CA6FE',
} as const

export type StatusColor = keyof typeof STATUS_COLORS
