import fetchUrl from 'fetch-promise';

const URL = 'http://localhost:3000/';

const sleep = (ms) => new Promise((fulfill) => setTimeout(fulfill, ms));

const MAX_REQUESTS = 5;    // requests per QUOTA_PERIOD
const QUOTA_PERIOD = 1000; // 1 sec

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
  console.log("apiCallWithQuota starting request promise ---\t" + now + '\t' + url);
  return fetchUrl(url);
}



/*
 * Download individual listings in parallel,
 * wait for all to be downloaded
 */
async function downloadListing(ids) {
  const URL_ITEM = 'http://localhost:3000/item';
  const reqPromises = [];
  ids.map((id) => reqPromises.push(apiCallWithQuota(URL_ITEM + id)));
  await Promise.all(reqPromises);
}


/*
 * Download a list of shops (it may take several pages/api-calls) and
 * for each bunch of ids download the listings
 */
async function downloadShop() {
  console.log('-- starting downloadShop');
  const URL_LIST = 'http://localhost:3000/list/';
  let pageCount = -1;
  let currentPage = 0;

  do {
    console.log('downloadShop: downloading:', URL_LIST + currentPage);
    try {
      const result = await apiCallWithQuota(URL_LIST + currentPage);
      let jsonResult = JSON.parse(result.buf.toString('utf8'));
      pageCount = jsonResult.pages;
      console.log('downloadShop: downloaded page:', currentPage, ', pageCount:', pageCount);
      await downloadListing(jsonResult.list);
    } catch (err) {
      throw "downloadShop", err;
    }
    currentPage++;
  } while (pageCount > currentPage);

}

async function main() {
  try {
    await downloadShop();
  } catch (err) {
    console.log('Error:',err);
  }
}
main();
