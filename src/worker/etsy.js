import crypto from 'crypto';
import request from 'request';
import OAuth   from 'oauth-1.0a';
import { dbInit, db, storeResults, getChangedListings } from './db/db';
import { sleep } from './util';

const MAX_REQUESTS = 24;    // requests per QUOTA_PERIOD
const QUOTA_PERIOD = 1000;  // 1 sec
const BASE_URL = 'https://openapi.etsy.com'

  // Env. configuration
const VELA_USER_TOKEN = 'VELA_USER_TOKEN';
const VELA_USER_SECRET = 'VELA_USER_SECRET';
const VELA_CLIENT_TOKEN = 'VELA_CLIENT_TOKEN';
const VELA_CLIENT_SECRET = 'VELA_CLIENT_SECRET';
const VELA_SHOP_ID = 'VELA_SHOP_ID';

const CONSUMER = {};

/********************************************************************************
 * static initialization of the module - Vela keys
 */
export function init(cfg) {
  CONSUMER.key = cfg[VELA_CLIENT_TOKEN];
  CONSUMER.secret = cfg[VELA_CLIENT_SECRET];
}



/********************************************************************************
 * Class for Etsy API calls
 *   - handles oauth
 *   - takes care of quota/sec
 * Usage: o.get(url), o.put(url, data), o.push(url, data)
 */
export class Etsy {

  constructor(userToken, userSecret) {
    this.currentRequests = [];

    this.userKeys = {
      key: userToken,
      secret: userSecret
    };
    this.oauth = OAuth({
      consumer: CONSUMER,
      signature_method: 'HMAC-SHA1',
      hash_function: function(base_string, key) {
          return crypto.createHmac('sha1', key).update(base_string).digest('base64');
      }
    });
  }

   /********************************************************************************
   * http request with oauth, return a promise
   */
  oauth_request(method, url, data=null) {
    const request_param = {
        url: url,
        method: method,
    };
    if (method === 'GET') {
      request_param.headers = this.oauth.toHeader(this.oauth.authorize({url, method}, this.userKeys))
    } else {
      request_param.form = this.oauth.authorize({url, method, data}, this.userKeys)
    }
    return new Promise(function(resolve, reject) {
      request(request_param, function(error, res, data) {
        if (error !== null) {
          console.log(error);
          reject(error);
        } else {
          if (('' + res.statusCode).substring(0,1) == '2') {
            resolve({data: data, statusCode: res.statusCode});
          } else {
            reject({error: 'HTTP returned statusCode ' + res.statusCode, detail: {
              request_param,
              data,
              statusCode: res.statusCode
            }});
          }
        }
      });
    });
  };


  /********************************************************************************
   * if quota limit is reached then sleep a while, and then
   * make an API call and return a promise
   */
  async apiCallWithQuota(method, url, data) {
    url = BASE_URL + url;
    let now;
    while (true) {
        // filter out tasks older than 1s
      now = (new Date()).getTime();
      this.currentRequests = this.currentRequests.filter((t) => (t >= now - QUOTA_PERIOD));
       // if the quota is not reached then continue, otherwise sleep & retry
      if (this.currentRequests.length < MAX_REQUESTS) {
        this.currentRequests.push(now);
        break;
      } else {
        await sleep(this.currentRequests[0] - now + QUOTA_PERIOD);
      }
    }
    return this.oauth_request(method, url, data);
  }


  /********************************************************************************
   * methods to use for API calls
   */
  get = (url) => this.apiCallWithQuota('GET', url);
  put = (url, data) => this.apiCallWithQuota('PUT', url, data);
  post = (url, data) => this.apiCallWithQuota('POST', url, data);
}

