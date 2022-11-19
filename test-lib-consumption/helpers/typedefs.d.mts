/**
 * Based on manual try&error and https://verdaccio.org/docs/verdaccio-programmatically#using-the-module-api,
 * it seems like Verdaccio takes the Config object as input and returns a Node.js http server.
 */
declare module 'verdaccio' {
  import type { Config } from '@verdaccio/types';
  import type { Server } from 'node:http';
  export function runServer(config?: string | Config): Promise<Server>;
}

declare var verdaccioPort: number;
