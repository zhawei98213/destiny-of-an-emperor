declare module "node:path" {
  export function dirname(path: string): string;
  export function join(...paths: string[]): string;
  export function relative(from: string, to: string): string;
  export function resolve(...paths: string[]): string;
  const pathModule: {
    dirname: typeof dirname;
    join: typeof join;
    relative: typeof relative;
    resolve: typeof resolve;
  };
  export default pathModule;
}

declare module "node:fs/promises" {
  export interface DirentLike {
    isFile(): boolean;
    name: string;
  }

  export function mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
  export function readdir(
    path: string,
    options: { withFileTypes: true },
  ): Promise<DirentLike[]>;
  export function readFile(path: string, encoding: "utf8"): Promise<string>;
  export function writeFile(path: string, data: string, encoding: "utf8"): Promise<void>;
}

declare module "node:url" {
  export function fileURLToPath(url: string | URL): string;
}

declare module "node:child_process" {
  export interface SpawnOptionsLike {
    cwd?: string;
    env?: Record<string, string | undefined>;
    shell?: boolean;
    stdio?: ["ignore", "pipe", "pipe"];
  }

  export interface SpawnedProcessLike {
    stdout: {
      on(event: "data", listener: (chunk: { toString(): string }) => void): void;
    };
    stderr: {
      on(event: "data", listener: (chunk: { toString(): string }) => void): void;
    };
    on(event: "close", listener: (exitCode: number | null) => void): void;
  }

  export function spawn(
    command: string,
    args?: string[],
    options?: SpawnOptionsLike,
  ): SpawnedProcessLike;
}

declare const process: {
  argv: string[];
  exitCode?: number;
  env: Record<string, string | undefined>;
  stdout: {
    write(message: string): void;
  };
  cwd(): string;
};
