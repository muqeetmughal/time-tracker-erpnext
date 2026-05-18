declare module "better-sqlite3" {
  type RunResult = {
    changes: number;
    lastInsertRowid: number | bigint;
  };

  type Statement = {
    run: (...params: unknown[]) => RunResult;
  };

  class Database {
    constructor(filename: string);
    exec(sql: string): void;
    prepare(sql: string): Statement;
  }

  export default Database;
}
