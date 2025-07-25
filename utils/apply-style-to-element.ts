export function applyStyleToElement(
  element: HTMLElement,
  key: string,
  value: string
) {
  // Use setProperty instead of directly manipulating the style attribute
  // This avoids hydration mismatches by not touching the style attribute directly
  element.style.setProperty(`--${key}`, value);
}
