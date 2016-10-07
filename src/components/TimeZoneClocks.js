import React, { PropTypes } from 'react';
import { Clock } from './Clock';


/*
 * Bunch of Clocks with different timezones
 */
export const TimeZoneClocks = ({ time, clocks, onRemoveClock }) => (
  <div>
    {(clocks.length > 0) ? ( <h2>Time Zones</h2> ) : <br />}
    {clocks.map((timeZone, i) => (
      <div key={i} className="tz-clock" onClick={()=>onRemoveClock(timeZone)}>
        <Clock time={time} timeZone={timeZone}/>
        <div>{timeZone}</div>
      </div>
    ))}
  </div>
);
TimeZoneClocks.propTypes = {
  time: PropTypes.number.isRequired,
  clocks: PropTypes.array.isRequired,
  onRemoveClock: PropTypes.func.isRequired
};

