// Shim for Astro virtual fonts module to satisfy the TS language server in editors
// This file is safe and only affects type checking, not runtime.
declare module 'virtual:astro:assets/fonts/internal' {
  export type AstroFontEntry = any;
  export const internalConsumableMap: any;
  const mod: any;
  export default mod;
}

// Fallback for any other virtual font modules
declare module 'virtual:astro:assets/fonts/*' {
  const anyModule: any;
  export default anyModule;
}

declare module 'virtual:astro:*' {
  const anyModule: any;
  export default anyModule;
}
