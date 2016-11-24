const pg = require('pg');

let dbPool = undefined;
export const db = () => dbPool;




/*
 * Save listings to the DB
 *    id: 123,
 *    data: { ... }
 */
export function storeResults(listingId, data) {
  const Sql = 'INSERT INTO listings (id, data) VALUES ($1, $2::json)';
  return dbPool.query(Sql, [listingId, data]);
}


/*
 * Get changed listings
 */
export function getChangedListings(shopId) {
  const Sql = 'SELECT id, data FROM listings';
  return dbPool.query(Sql);
}


/*
 * Connect to the DB, set dbPool object
 * cfg: {
 *   VELA_DB_USER: 'vela',
 *   VELA_DB_PASS: 'vela',
 *   VELA_DB_HOST: 'localhost',
 *   VELA_DB_PORT: 5432,
 *   VELA_DB_NAME: 'vela'
 * }
 */
const VELA_DB_USER = 'VELA_DB_USER';
const VELA_DB_PASS = 'VELA_DB_PASS';
const VELA_DB_NAME = 'VELA_DB_NAME';
const VELA_DB_HOST = 'VELA_DB_HOST';
const VELA_DB_PORT = 'VELA_DB_PORT';
export function dbInit() {
  let dbCfg = {
    user: process.env[VELA_DB_USER],
    password: process.env[VELA_DB_PASS],
    database: process.env[VELA_DB_NAME],
    host: process.env[VELA_DB_HOST],
    port: process.env[VELA_DB_PORT],
    max: 10,                  // max number of clients in the pool
    idleTimeoutMillis: 1000, // how long a client is allowed to remain idle before being closed
  };

  dbPool = new pg.Pool(dbCfg);
}

