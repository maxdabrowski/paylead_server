import * as path from 'path';
import * as express from 'express';
import { createServer } from 'http';
import { router } from './rest-paylead-mdb';

const mongoose = require('mongoose');
var config = require('./config');

mongoose.connect(config.db, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('mongoDB connect')
});

const app = express();
var PORT = process.env.PORT || 9090;
app.use('/api', router);
app.use('/data', express.static(path.join(__dirname, '..', 'data')));
const server = createServer(app);

server.listen(PORT, () => {
  console.log('Listening on localhost:9090');
});
