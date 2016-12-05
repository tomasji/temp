import * as db from './db/db';
import { logD, logI, logE } from './log';
import * as etsyApi from './etsy';
import { sleep } from './util';

const API_RETRY_COUNT = 2;
const RETRY_INTERVALS = [20, 1800, 7200];


/********************************************************************************
 * run async function func(). if it fails, repeat up to retryCount times
 * if ignoreFunc is defined, run ignoreFunc(err) to check the error
 */
async function retry(lg, func, ignoreFunc=null, retryCount=API_RETRY_COUNT) {
  for (let i = 0; i < retryCount; i++) {
    try {
      return await func();
    } catch (err) {
      if (ignoreFunc != null) {
        if (ignoreFunc(err)) {
          return {ignoreFunc: true};
        }
      }
      logI(lg, `attempt #${i} failed`, err);
      if (i + 1 < retryCount) {
        await sleep(10000);
      } else {
        throw err;
      }
    }
  }
}



/********************************************************************************
 * Create new sections on Etsy, check for the case when it already exists
 */
export async function createSections(task, etsy, channelShopId) {
  const lg = `t${task.id},s${task.shopId},createSections`;
  logD(lg);
  let sectionId, name;

    // get sections with etsy ID == NULL
  const result = await db.getNewShopSections(task.shopId);
  logD(lg, 'New sections to be created on Etsy:', result.rows);
  if (result.rows.length > 0) {

    for (let row of result.rows) {
      [sectionId, name] = [row['id'], row['value']];
      logD(lg, 'Creating section', sectionId, name);
      const etsyResult = await retry(lg,
        () => etsy.post(`/v2/shops/${channelShopId}/sections`, {title: name}),
        (err) => {
          if ('detail' in err && 'data' in err.detail && err.detail.data == 'You already have a shop section with that name.') {
            logD(lg, `section already exists`);
            return true;
          }
          return false;
        }
      );
      if ('ignoreFunc' in etsyResult) {
        logE(lg, `Secction ${name} exists, but is not updated in the DB`); // TODO - update it
      } else {
        const response = JSON.parse(etsyResult.data);
        const shopSectionId = response.results[0].shop_section_id;
        await db.updatShopSection(sectionId, shopSectionId);
        logD(lg, `Section ${name} (${sectionId}) created: ${shopSectionId}`);
      }
    }
  }
}



/********************************************************************************
 * Upload main fields of the listing (PUT req)
 * return {dbFields: [], httpResponse: resp}
 */
async function uploadListingBase(task, etsy, productId) {
  const lg = `t${task.id},s${task.shopId},pr${productId},uploadListingBase`;
  const PUT_FIELDS = { title: 1, description: 1, listing_id: 1, state: 1 };
  const putData = {};
  logD(lg);

    // get modified data
  const dbResult = await db.getModifiedFields(productId);
  dbResult.rows.map(row => {
    if (row.property_name in PUT_FIELDS) {
      putData[row.property_name] = row.property_value;
    }
  });

    // upload 'basic' listing data
  if (Object.keys(putData).length > 0) {
    logD(lg, 'data:', putData);
    const etsyResult = await retry(lg, () => etsy.put('/v2/listings/' + putData.listing_id , putData));
    logD(lg, 'completed successfully');
    return { dbFields: dbResult.rows, httpResponse: etsyResult };
  }
  return { dbFields: dbResult.rows, httpResponse: '' };
}
  


/********************************************************************************
 * Upload variations of the listing (POST req)
 * return httpResponse:
 */
async function uploadListingVariations(task, etsy, productId, listingId) {
  const lg = `t${task.id},s${task.shopId},pr${productId},uploadListingVariations`;
  logD(lg, 'listingId:', listingId);
  const dbResultVariations = await db.getVariations(productId);
  const varData = [];
  dbResultVariations.rows.map(r => {varData.push({
      property_id: r.property_id,
      value: r.value,
      is_available: r.is_available,
      price: r.price });
  });
  logD(lg, 'data:', varData);
  const etsyResult = await retry(lg, () => etsy.post(`/v2/listings/${listingId}/variations`, {variations: JSON.stringify(varData)}));
  logD(lg, 'completed successfully');
  return { etsyResult };
}
  


/********************************************************************************
 * Upload individual listing (changed fields)
 */
async function uploadListing(task, etsy, productId, shopId) {
  let etsyResult, dbFields;
  let listingId;
  const lg = `t${task.id},s${task.shopId},pr${productId},uploadListing`;
  logD(lg);

  try {
      // upload base listing
    const resp = await uploadListingBase(task, etsy, productId);
    etsyResult = resp.httpResponse;
    dbFields = resp.dbFields;
    dbFields.map((i) => {if (i.property_name === 'listing_id') listingId = i.property_value;});
    logD(lg, 'listingId:', listingId);

      // upload variations (if changed)
    const modVariations = dbFields.filter((i) => i.property_name === '_HIVE_variations_modified_by_hive');
    if ((modVariations.length > 0) && (modVariations[0].property_value == 'true')) {
      etsyResult = await uploadListingVariations(task, etsy, productId, listingId);
    }

      // upload photos -- TODO

      // listing synced; update DB accordingly
    decrementShopToUpload(shopId);
    await db.setModifiedByHive(productId, false); // TODO - handle the race condition!!!
    return etsyResult;
  } catch(err) {
    logE(lg, err);
    return ('error' in err) ? {...err, productId} : {error: ''+err, detail: err, productId};
  }
}


/********************************************************************************
 * Set shop status and number of listings to upload (for countdown)
 */
async function setShopStatus(shopId, shopStatus) {
  try {
    await db.setShopStatus(shopId, shopStatus);
  } catch (err) {
    logE('setShopStatus', err);
  }
}

/********************************************************************************
 * Set shop number of listings to upload (for countdown)
 */
async function setShopUpdateCount(shopId) {
  try {
    await db.setShopUpdateCount(shopId);
  } catch (err) {
    logE('setShopUpdateCount', err);
  }
}


/********************************************************************************
 * Decrement _to_upload
 */
async function decrementShopToUpload(shopId) {
  try {
    await db.decrementShopToUpload(shopId);
  } catch (err) {
    logE('decrementShopToUpload', err);
  }
}



/********************************************************************************
 * Upload changed listings to Etsy
 *  - connect to the DB
 */
export async function uploadChanges(task) {
  const lg = `t${task.id},s${task.shopId},uploadChanges`;
  logD(lg, task);
  const shopId = task.shopId;
  const failedListings = [];
  let currentSections;
  let listings;
  let userToken, userSecret;
  let channelShopId;

  // TODO: check ban / 24 quota in our DB, reschedule task if needed


    // get tokens for given user/shop
  try {
    const r= await db.getShopTokens(shopId);
    [userToken, userSecret, channelShopId] = [r.rows[0].token, r.rows[0].tokensecret, r.rows[0].channelshopid];
  } catch(err) {
    logE(lg, 'getShopTokens failed:', err);
    throw err;
  }

    // Initialize etsy api
  const etsy = new etsyApi.Etsy(userToken, userSecret)
  
    // Create section(s) on Etsy if there are some new in our DB
  await createSections(task, etsy, channelShopId);

    // Update shop status: _to_upload, _sync
  setShopStatus(shopId, 'sync');
  setShopUpdateCount(shopId);

    // Process changed listins in batches, loop until there are listings to upload
  do {
      // Get 1st 100 changed listings (except for the ones we processed with failure)
    listings = [];
    const result = await db.getModifiedLisgtings(shopId, failedListings);
    result.rows.map(row => listings.push({ id: row.id, sectionId: row.section_id }));
    logD(lg, 'modified listings:', result.rows);
    if (result.rows.length == 0) { break; }

      // Upload individual listings - async
    const uploadPromises = [];
    listings.map(l => uploadPromises.push(uploadListing(task, etsy, l.id, shopId)))
    const results = await Promise.all(uploadPromises);
    logD(lg, 'uploadPromises results: ', results);

      // Add failed listings to failedListings
    results.map((r) => {if (r.error) {failedListings.push(r.productId)}});
    logD(lg, 'failedListings:', failedListings);
  } while (listings.length > 0);


    // And we are done
  logI(lg, 'All modified listings processed', task, 'channelShopId:', channelShopId);
  if (failedListings.length > 0) {
    // re-schedule task if TTL
    if (task.retry < RETRY_INTERVALS.length) {
      try {
        logE(lg, 'Re-scheduling task', task, 'in', RETRY_INTERVALS[task.retry], 'seconds');
        await db.rescheduleTask(task.id, RETRY_INTERVALS[task.retry]);
      } catch(err) {
        logE(lg, 'Cannot re-schedule task', err);
      }
      return;
    } else {
      logE(lg, 'Upload task TTL reached, deleting');
    }
  }
  // Delete task
  try {
    await db.deleteTask(task.id);
  } catch(err) {
    logE(lg, 'Cannot delete task', err);
  }
}
