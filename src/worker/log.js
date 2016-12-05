/*
 * Simple logging to stdout
 *   logD(...) log(...)  debug
 *   logI(...)           info
 *   logW(...)           waring
 *   logE(...)           error
 *   die(...)            logE() + exit(1)
 *
 *   setLogLevel( LOG_ERROR | LOG_WARNING | LOG_INFO | LOG_DEBUG )
 */
const util = require('util');
import dateFormat from 'dateformat';

const LOG_ERROR = 1;
const LOG_WARNING = 2;
const LOG_INFO = 3;
const LOG_DEBUG = 4;
const PREFIX = {
  1: 'ERROR:',
  2: 'WARN:',
  3: 'INFO:',
  4: 'DEBUG:'
};
let logLevel = LOG_DEBUG;

export function setLogLevel(level) {
  logLevel = level;
}


function logX(...args) {
  if (args.length < 2) return;

  const msgLevel = args[0];
  const newArgs = [dateFormat((new Date()).getTime(), 'dd.mm HH:MM:ss')];
  if (PREFIX[msgLevel]) {
    newArgs.push(PREFIX[msgLevel]);
  }
  for (let i = 1; i < args.length; i++) {
    if ((typeof args[i]) === 'string') {
      newArgs.push(args[i]);
    } else {
      newArgs.push(util.inspect(args[i], { showHidden: false, depth: null }));
    }
  }
  if (msgLevel <= logLevel) {
    /* eslint-disable no-console */
    console.log(...newArgs);
    /* eslint-enable no-console */
  }
}

export function logE(...args) { logX(LOG_ERROR, ...args); }
export function logW(...args) { logX(LOG_WARNING, ...args); }
export function logI(...args) { logX(LOG_INFO, ...args); }
export function logD(...args) { logX(LOG_DEBUG, ...args); }
export function log(...args) { logX(LOG_DEBUG, ...args); }

export function die(...args) { logX(LOG_ERROR, ...args); process.exit(1); }
