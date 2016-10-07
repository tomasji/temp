import React, { Component } from 'react';


/*
 * Dropdown with timezones + button to add a new clock
 */
export class Controls extends Component {
  propTypes: {
    tz: React.PropTypes.array.isRequired,
    onAddClock: React.PropTypes.func.isRequired
  }
  render() {
    const { timeZones, onAddClock } = this.props;
    return (
      <div className="controls">
        <label>Select timezone: </label> 
        <select ref='timeZone'>
          {timeZones.map((t, i) => (<option value={t} key={i}>{t}</option>))}
        </select>
        <button type="submit" onClick={() => {
          onAddClock(this.refs.timeZone.value);
        }}>Add Clock</button>
      </div>
    );
  }
};

