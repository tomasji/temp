import { getClockRoot } from './';

export const getTime = appState => getClockRoot(appState).time;
export const getClocks = appState => getClockRoot(appState).clocks;
export const getTimeZones = appState => getClockRoot(appState).timeZones;
