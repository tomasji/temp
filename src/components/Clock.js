import React, { PropTypes } from 'react';
import {tz} from 'moment-timezone';
import moment from 'moment';

const FORMAT = 'HH:mm:ss';

/*
 * Format time string - local or specific timezone
 */
const formatTime = (time, timeZone) => {
  if (timeZone === undefined) {
    return new moment(time).format(FORMAT);
  } else {
    return tz(time, timeZone).format(FORMAT);
  }
}


/*
 * Digital Clock
 */
export const Clock = ({ time, timeZone }) => (
  <span className="clock-value">{formatTime(time, timeZone)}</span>
);
Clock.propTypes = {
  time: PropTypes.number.isRequired
};

