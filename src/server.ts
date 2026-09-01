import Logger from './core/Logger';
import { port } from './config';
import app from './app';

app
  .listen({ port: Number(port), host: '0.0.0.0' })
  .then(() => {
    Logger.info(`server running on port : ${port}`);
  })
  .catch((e) => Logger.error(e));
