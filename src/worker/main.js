import fs from 'fs';
import * as db from './db/db';
import { logD, logI, logE } from './log';
import { uploadChanges } from './upload';
import * as etsy from './etsy';
import { sleep } from './util';

const CONFIG_FILE = 'etc/woker-config.json';

/********************************************************************************
 * Initialize the worker
 *  - read config, validate
 *  - connect to the DB
 */
function init() {
    // read config
  const CFG_VARS = 'VELA_DB_USER VELA_DB_PASS VELA_DB_NAME VELA_DB_HOST VELA_DB_PORT VELA_CLIENT_TOKEN VELA_CLIENT_SECRET';
  let cfg;
  try {
    const data = fs.readFileSync(CONFIG_FILE);
    cfg = JSON.parse(data);
    CFG_VARS.split(' ').map(p => {
      if (!(p in cfg)) {
        throw new Error("variable '" + p + "' not found in " + CONFIG_FILE);
      }
    })
  } catch(err) {
    logE('Problem reading config file ' + CONFIG_FILE + '\n' + err);
    process.exit(1);
  }

    // connect to the DB
  db.dbInit(cfg);
  db.db().query('select version()')
    .then(res => logI('Connected to DB:', res.rows[0].version),
    err => { logE('Cannot read data from the DB.', err.message); process.exit(1);});

    // default for Etsy API
  etsy.init(cfg);
}



/********************************************************************************
 * Get new task from the DB, or undefined
 */
async function getNewTask() {
  try {
    const result = await db.getTask('host:port');
    const task = result.rows[0];
    if (task.id !== null) {
      logI('Got task', task);
      return { id: task.id, taskType: task.task_type, shopId: task.shop_id, retry: task.retry };
    } else {
      logD('No task available');
    }
  } catch(err) {
    logE('getNewTask failed:', err);
  }
}



/********************************************************************************
 * Main loop:
 *  - get a new task from the DB and process it
 */
async function main() {
  for (;;) {
    let task;
    try {
      task = await getNewTask();
      if (task === undefined) {
        await sleep(5000)      
      } else {
        logI('Processing task', task);
        switch (task.taskType) {
          case 'upload':
            await uploadChanges(task);
            break;
          case 'scheduled_sync':
            await syncShop(task);
            break;
          default:
            logE('Unknow task type', task_type);
        }
      }
    } catch(err) {
      logE('main() Task failed:', err);
      logD('failing task ', task);
      // TODO fail task
    }
  }
}


init();
main();
