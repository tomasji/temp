import React, { PropTypes } from 'react';
import { Clock } from './Clock';
import { TimeZoneClocks } from './TimeZoneClocks';
import { Controls } from './Controls';


/*
 * Main Clock component
 */
const MainClock = ({ time, clocks, timeZones, onAddClock, onRemoveClock }) => (
  <div>
    <h1>Clock App</h1>
    <div className="local-time">
      <Clock time={time} />
      <div>Local time</div>
    </div>
    <TimeZoneClocks time={time} clocks={clocks} onRemoveClock={onRemoveClock} />
    <Controls timeZones={timeZones} onAddClock={onAddClock} />
  </div>
);
MainClock.propTypes = {
  time: PropTypes.number.isRequired,
  clocks: PropTypes.array.isRequired,
  timeZones: PropTypes.array.isRequired,
  onAddClock: PropTypes.func.isRequired,
  onRemoveClock: PropTypes.func.isRequired
};

export default MainClock;
