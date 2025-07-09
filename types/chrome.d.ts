declare global {
  interface Window {
    chrome?: {
      storage?: {
        local: {
          get: (keys: string[], callback: (result: Record<string, any>) => void) => void;
          set: (items: Record<string, any>, callback?: () => void) => void;
        };
      };
    };
  }
}

export {};