// The Vitest test environment (jsdom) doesn't implement matchMedia - a known
// gap, not something real browsers lack. ThemeService reads it to pick an
// initial light/dark icon state, so tests need a stub.
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
