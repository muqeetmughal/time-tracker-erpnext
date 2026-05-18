declare module "better-sqlite3" {
  type RunResult = {
    changes: number;
    lastInsertRowid: number | bigint;
  };

  type Statement = {
    run: (...params: unknown[]) => RunResult;
    get: (...params: unknown[]) => unknown;
    all: (...params: unknown[]) => unknown[];
  };

  class Database {
    constructor(filename: string);
    exec(sql: string): void;
    prepare(sql: string): Statement;
  }

  export default Database;
}

declare module "uiohook-napi" {
  export const uIOhook: {
    on: (eventName: string, listener: () => void) => void;
    off: (eventName: string, listener: () => void) => void;
    start: () => void;
    stop: () => void;
  };
}
