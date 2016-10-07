import * as ActionTypes from '../constants/actionTypes';
import { tz } from 'moment-timezone';

const allTimeZones = tz.names().sort();

const initialState = {
  time: 0,
  clocks: [],
  timeZones: allTimeZones
};



export default (state = initialState, { type, data }) => {
  let newClocks;
  switch (type) {
    case ActionTypes.NEW_TIME:
      return { ...state, time: data };

    case ActionTypes.ADD_CLOCK:
      newClocks = state.clocks.concat(data);
      return state.clocks.includes(data) ? state : {
        ...state,
        clocks: newClocks,
        timeZones: allTimeZones.filter((tz) => (! newClocks.includes(tz))).sort()
      };

    case ActionTypes.REMOVE_CLOCK:
      newClocks = state.clocks.filter((i) => i !== data);
      return {
        ...state,
        clocks: newClocks,
        timeZones: allTimeZones.filter((tz) => (! newClocks.includes(tz))).sort()
      };

    default:
      return state;
  }
};
