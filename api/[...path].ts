import { startServer } from '../server';

let appPromise: ReturnType<typeof startServer> | null = null;

export default async function handler(req: any, res: any) {
  appPromise ??= startServer();
  const app = await appPromise;
  return app(req, res);
}
