
/********************************************************************************
 * sleep n milisecons - for async functions
 */
export const sleep = (ms) => new Promise((fulfill) => setTimeout(fulfill, ms));

