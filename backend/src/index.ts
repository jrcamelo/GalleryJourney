

import express from 'express';
import cors from 'cors';

import Database from './data/Database';
import Cache from './data/MemoryCache';
import RouteManager from './api/RouteManager';
import { FRONTEND_URL, FRONTEND_URL_LOCAL, PORT } from './constants';


const CORS_WHITELIST = [FRONTEND_URL, FRONTEND_URL_LOCAL];

const app = express();
app.use(express.json());
app.use(setupCors());

const db = Database.getInstance();
const cache = Cache.getInstance();
const routeManager = new RouteManager(app, db, cache);


function setupCors() {
  return cors({
    origin: (origin, callback) =>
      callback(null, !origin || CORS_WHITELIST.includes(origin)),
    credentials: true
  });
}

async function startServer() {
  await db.connect();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    routeManager.registerRoutes();
  });
}

startServer();