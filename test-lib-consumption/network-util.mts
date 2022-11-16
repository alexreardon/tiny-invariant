import net from 'node:net';

export const networkUtil = {
  getRandomPort,
};

/**
 * Based on https://github.com/nestjs/nest/blob/8e3af065bb9abbecc91b4e6068c8e205ef79d165/integration/nest-application/get-url/e2e/utils.ts#L5
 */
async function getRandomPort(): Promise<number> {
  const server = net.createServer();
  return new Promise<number>((resolve) => {
    server.listen(0, () => {
      const port = (server.address() as net.AddressInfo).port;
      server.close();
      resolve(port);
    });
  });
}
