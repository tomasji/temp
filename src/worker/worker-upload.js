import fetchUrl from 'fetch-promise';
import crypto from 'crypto';
import OAuth from 'oauth';
import { dbInit, db, storeResults, getChangedListings } from './db/db';

const MAX_REQUESTS = 24;    // requests per QUOTA_PERIOD
const QUOTA_PERIOD = 1000;  // 1 sec
const PAGE_LIMIT = 100;  // 1 sec
const BASE_URL = 'https://openapi.etsy.com'
//const BASE_URL = 'http://localhost:3000'

  // Env. configuration
const VELA_USER_TOKEN = 'VELA_USER_TOKEN';
const VELA_USER_SECRET = 'VELA_USER_SECRET';
const VELA_CLIENT_TOKEN = 'VELA_CLIENT_TOKEN';
const VELA_CLIENT_SECRET = 'VELA_CLIENT_SECRET';
const VELA_SHOP_ID = 'VELA_SHOP_ID';

const TOKEN = {
    key: process.env[VELA_USER_TOKEN],
    secret: process.env[VELA_USER_SECRET]
};
const oauth = new OAuth.OAuth(
      null,
      null,
      process.env[VELA_CLIENT_TOKEN],
      process.env[VELA_CLIENT_SECRET],
      '1.0A',
      null,
      'HMAC-SHA1'
);
const SHOP_ID = process.env[VELA_SHOP_ID];


/*
 * fetch URL with oauth, return promise
 */
function fetch(url) {  
    return new Promise(function(resolve, reject) {
        oauth.get(url, TOKEN.key, TOKEN.secret, (e, data, res) => {
          if (e) {
            reject(e);
          } else {
            resolve({data: data, res: res});
          }
        }); 
    });
}


/*
 * sleep n milisecons - for async functions
 */
const sleep = (ms) => new Promise((fulfill) => setTimeout(fulfill, ms));



/*
 * if quota limit is reached then sleep a while, and then
 * make an API call and return a promise
 */
let currentRequests = [];
async function apiCallWithQuota(url) {
  let now;
  while (true) {
      // filter out tasks older than 1s
    now = (new Date()).getTime();
    currentRequests = currentRequests.filter((t) => (t >= now - QUOTA_PERIOD));
     // if the quota is not reached then continue, otherwise sleep & retry
    if (currentRequests.length < MAX_REQUESTS) {
      currentRequests.push(now);
      break;
    } else {
      await sleep(currentRequests[0] - now + QUOTA_PERIOD);
    }
  }
  return fetch(url);
}



/*
 * Upwnload individual listings in parallel,
 * wait for all to be uploaded
 */
async function uploadListing(listing) {
  const URL = 'http://google.cz/';
  let res;
  console.log('fetching URL 1', listing.id);
  res = await apiCallWithQuota(URL);
  console.log('response URL 1:', listing.id);

  console.log('fetching URL 2', listing.id);
  res = await apiCallWithQuota(URL);
  console.log('response URL 2:', listing.id);

  console.log('fetching URL 3', listing.id);
  res = await apiCallWithQuota(URL);
  console.log('response URL 3:', listing.id);
  return ({data: 'foo', res: res});
}


/*
 * Download a list of shops (it may take several pages/api-calls) and
 * for each bunch of ids download the listings
 */
async function uploadShop(shopId) {
  console.log('-- starting uploadShop');
  let changed_items = 0;
  let reqPromises = [];

  do {
    reqPromises = [];
    try {
      let changedListings = await getChangedListings(shopId);
      changedListings.rows.map((listing) => reqPromises.push(uploadListing(listing)));
      const results = await Promise.all(reqPromises);
    } catch (err) {
      throw err;
    }
  } while (false);

}


/*
 * run uploadShop, report errors
 */
async function main() {
  try {
    await uploadShop();
  } catch (err) {
    console.log('Error: main:',err);
  }
}




// check env vars
for (let v of ['VELA_CLIENT_TOKEN', 'VELA_CLIENT_SECRET', 'VELA_USER_TOKEN', 'VELA_USER_SECRET', 'VELA_SHOP_ID',
    'VELA_DB_USER', 'VELA_DB_PASS', 'VELA_DB_HOST', 'VELA_DB_PORT', 'VELA_DB_NAME']) {
  if (! process.env[v]) {
    console.error(`ERROR: env variable ${v} not defined`);
    process.exit(1);
  }
}

  // connect to the DB
dbInit();
db().query('select version()')
  .then(res => console.log('Connected to DB:', res.rows[0].version),
  err => { console.log('Cannot read data from the DB.', err.message); process.exit(1);});

main();
