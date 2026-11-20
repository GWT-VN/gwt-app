/**
 * Kiểu chữ token (`--text-*` của tokens.css). Shorthand `font:` xoá font-feature-settings → kèm `inherit` để giữ
 * cv11/ss03 của DsRoot (như bundle.css bản 29).
 */
export const CHU = {
  h1: '[font:var(--text-heading-lg)] [font-feature-settings:inherit]',
  h2: '[font:var(--text-heading-md)] [font-feature-settings:inherit]',
  h3: '[font:var(--text-heading-xs)] [font-feature-settings:inherit]',
  md: '[font:var(--text-text-md)] [font-feature-settings:inherit]',
  sm: '[font:var(--text-text-sm)] [font-feature-settings:inherit]',
  xs: '[font:var(--text-text-xs)] [font-feature-settings:inherit]',
}
