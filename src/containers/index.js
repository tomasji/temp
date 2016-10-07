import { connect } from 'react-redux';

import * as ActionTypes from '../constants/actionTypes';
import MainClock from '../components/MainClock';
import * as ClockSelectors from '../selectors/clockSelectors';

const mapStateToProps = appState => ({
  time: ClockSelectors.getTime(appState),
  clocks: ClockSelectors.getClocks(appState),
  timeZones: ClockSelectors.getTimeZones(appState)
});

const mapDispatchToProps = dispatch => ({
  onAddClock: (timeZone) => dispatch({ type: ActionTypes.ADD_CLOCK, data: timeZone}),
  onRemoveClock: (timeZone) => dispatch({ type: ActionTypes.REMOVE_CLOCK, data: timeZone}),
});

export default connect(mapStateToProps, mapDispatchToProps)(MainClock);
