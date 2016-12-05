const pg = require('pg');

let dbPool = undefined;
export const db = () => dbPool;


/********************************************************************************
 * Get Etsy account tokens for given shop
 */
export function getShopTokens(shopId) {
  const Sql = `
    SELECT DISTINCT a1.property_value as token, a2.property_value as tokenSecret, s.property_value as channelShopId
    FROM accounts a1
      JOIN accounts a2 ON a1.id = a2.id
      JOIN shops s ON s.account_id = a1.id
    WHERE
      a1.property_name = 'token' AND
      a2.property_name='tokenSecret' AND
      s.property_name = 'channelShopId' AND
      s.id = $1`;
  return dbPool.query(Sql, [shopId]);
}


/********************************************************************************
 * Get new task from the DB, or null
 */
export function getTask(worker) {
  const Sql = 'SELECT id, task_type, shop_id, retry FROM get_task($1)';
  return dbPool.query(Sql, [worker]);
}


/********************************************************************************
 * Delete task from the DB
 */
export function deleteTask(id) {
  const Sql = 'DELETE FROM tasks WHERE id = $1';
  return dbPool.query(Sql, [id]);
}

/********************************************************************************
 * Reschedule failed task
 */
export function rescheduleTask(taskId, plusSeconds) {
  const Sql = 'SELECT reschedule_task($1, $2)';
  return dbPool.query(Sql, [taskId, plusSeconds]);
}

/********************************************************************************
 * Set shop update count to the number of modified listings
 */
export function setShopUpdateCount(shopId) {
  const Sql = `
    UPDATE shops
      SET property_value = (
          SELECT count(id)
          FROM products
          WHERE
            property_name = '_modifiedByHive' AND
            property_value = 'true' AND
            shop_id = $1)
      WHERE
        property_name = '_to_upload' AND
        id = $1;
  `;
  return dbPool.query(Sql, [shopId]);
}


/********************************************************************************
 * Set shop status
 */
export function setShopStatus(shopId, shopStatus) {
  const Sql = "UPDATE shops SET property_value = $1 WHERE property_name = '_sync' AND id = $2";
  return dbPool.query(Sql, [shopStatus, shopId]);
}

/********************************************************************************
 * Decrement _to_upload shop field
 */
export function decrementShopToUpload(shopId) {
  const Sql = `
    UPDATE shops
      SET property_value = property_value::integer - 1
      WHERE
        property_name = '_to_upload' AND
        id = $1`;
  return dbPool.query(Sql, [shopId]);
}


/********************************************************************************
 * Get new shop sections
 */
export function getNewShopSections(shopId) {
  const Sql = 'SELECT id, value FROM shop_sections WHERE shop_id = $1 AND section_id IS NULL';
  return dbPool.query(Sql, [shopId]);
}


/********************************************************************************
 * Update shop section id on a new section
 */
export function updatShopSection(velaSectionId, shopSectionId) {
  const Sql = 'UPDATE shop_sections SET section_id = $1 WHERE id = $2';
  return dbPool.query(Sql, [shopSectionId, velaSectionId]);
}


/********************************************************************************
 * Get listings modified by hive
 */
export function getModifiedLisgtings(shopId, excludedIds) {
  const excludedString = (excludedIds.length > 0) ? ' AND id NOT in (' + excludedIds.join(',') + ') ' : '';
  const Sql = `
    SELECT DISTINCT p1.id, p2.property_value AS section_id
    FROM products p1 LEFT JOIN (
        SELECT id, property_value
        FROM products
        WHERE
          shop_id = $1 AND
          property_name = '_HIVE_section_id') p2
        ON p1.id = p2.id
    WHERE
      p1.id IN (
          SELECT id FROM products
          WHERE
            shop_id = $2 AND
            property_name = '_modifiedByHive' AND
            property_value = 'true'
            ${excludedString}
            LIMIT 100
      )`
  return dbPool.query(Sql, [shopId, shopId]);
}


/********************************************************************************
 * Get modified fields of the listing
 */
export function getModifiedFields(productId) {
  const Sql = `
    SELECT id, property_name, property_value
    FROM products
    WHERE id = $1 AND
      ((property_name in ('state', 'listing_id', '_HIVE_variations_modified_by_hive')) OR 
      (modified_at >= (
          SELECT modified_at
          FROM products
          WHERE id = $1 AND
          property_name = '_modifiedByHive'
      )))`
  return dbPool.query(Sql, [productId]);
}


/********************************************************************************
 * Get variations for the listing
 */
export function getVariations(productId) {
  const Sql = `
    SELECT v.property_id, vo.value, vo.is_available, vo.price
    FROM variations v
      JOIN variation_options vo ON v.id = vo.variation_id
    WHERE v.product_id = $1`;
  return dbPool.query(Sql, [productId]);
}


/********************************************************************************
 * Set _modifiedByHive on the listing
 */
export function setModifiedByHive(productId, modified) {
  const Sql = `
    UPDATE products
      SET property_value = $1
    WHERE
      id = $2 AND
    property_name = '_modifiedByHive'`;
  return dbPool.query(Sql, [modified, productId]);
}


/********************************************************************************
 * Save listings to the DB
 *    id: 123,
 *    data: { ... }
 */
export function storeResults(productId, data) {
  const Sql = 'INSERT INTO listings (id, data) VALUES ($1, $2::json)';
  return dbPool.query(Sql, [productId, data]);
}


/********************************************************************************
 * Get changed listings
 */
export function getChangedListings(shopId) {
  const Sql = 'SELECT id, data FROM listings';
  return dbPool.query(Sql);
}


/********************************************************************************
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
export function dbInit(cfg) {
  let dbCfg = {
    user: cfg[VELA_DB_USER],
    password: cfg[VELA_DB_PASS],
    database: cfg[VELA_DB_NAME],
    host: cfg[VELA_DB_HOST],
    port: cfg[VELA_DB_PORT],
    max: 10,                 // max number of clients in the pool
    idleTimeoutMillis: 1000, // how long a client is allowed to remain idle before being closed
  };

  dbPool = new pg.Pool(dbCfg);
}

