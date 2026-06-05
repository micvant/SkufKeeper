export type UnsavedBackHandler = () => boolean;

declare global {
  interface Window {
    __skufHandleBack?: UnsavedBackHandler;
  }
}

export function registerUnsavedBackHandler(handler: UnsavedBackHandler | undefined) {
  if (typeof window === "undefined") return;
  window.__skufHandleBack = handler;
}
