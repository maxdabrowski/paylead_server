import * as path from 'path';
import * as express from 'express';
import { createServer } from 'http';
import { router } from './rest-paylead';

const app = express();
app.use('/api', router);
app.use('/data', express.static(path.join(__dirname, '..', 'data')));
const server = createServer(app);
server.listen(9090, "localhost", () => {
  console.log('Listening on localhost:9090');
});
