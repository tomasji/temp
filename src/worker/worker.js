import fetchUrl from 'fetch-promise';
import crypto from 'crypto';
import OAuth from 'oauth';
import { dbInit, db, uploadResults } from './db/db';

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
 * Download individual listings in parallel,
 * wait for all to be downloaded
 */
async function downloadListing(ids) {
  const URL_ITEM1 = BASE_URL + '/v2/listings/';
  const URL_ITEM2 = '?includes=User,Shop,Section,Images,MainImage,Translations,Manufacturers,Variations&language=en';
  const reqPromises = [];
  const failedIds = [];
  ids.map((id) => reqPromises.push(
    apiCallWithQuota(URL_ITEM1 + id + URL_ITEM2).then(
      (response) => {
        if (response.res.statusCode == 200) {
          let jsonResult = JSON.parse(response.data.toString('utf8'));
          console.log('Downloaded listing:', jsonResult.results[0].listing_id, jsonResult.results[0].title);
          return uploadResults(jsonResult.results[0].listing_id, JSON.stringify(jsonResult));
        }
      },
      (err) => {
        console.log('Error listing download promise:', id, err);
      }
    ).then(
      (result) => {
        if (result !== undefined) {
          console.log('DB success. saved listing', id);
          return id;
        }
        failedIds.push(id);
      },
      (dbErr) => {
        console.log('DB Error listing not saved', id);
        failedIds.push(id);
      }
    )
  ));
  const results = await Promise.all(reqPromises);
  console.log('results:', results);
  console.log('failedIds:', failedIds);
}


/*
 * Download a list of shops (it may take several pages/api-calls) and
 * for each bunch of ids download the listings
 */
async function downloadShop() {
  console.log('-- starting downloadShop');
  const URL_LIST = BASE_URL + '/v2/shops/' + SHOP_ID + '/listings/draft?limit=' + PAGE_LIMIT + '&page=';
  let currentPage = 1;
  let nextPage = null;

  do {
    console.log('downloadShop: downloading:', URL_LIST + currentPage);
    try {
      const response = await apiCallWithQuota(URL_LIST + currentPage);
      if (response.res.statusCode == 200) {
        let jsonResult = JSON.parse(response.data.toString('utf8'));
        nextPage = jsonResult.pagination.next_page;
        let listingIds = jsonResult.results.map((r) => r.listing_id);
        await downloadListing(listingIds);
      } else {
        throw response;
      }
    } catch (err) {
      throw err;
    }
    currentPage++;
  } while (nextPage !== null);

}


/*
 * run downloadShop, report errors
 */
async function main() {
  try {
    await downloadShop();
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
