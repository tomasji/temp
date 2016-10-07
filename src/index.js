import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import RootContainer from './containers';
import reducer from './reducers';

import * as ActionTypes from './constants/actionTypes';

const store = createStore(reducer, window.devToolsExtension ? window.devToolsExtension() : val => val);

render((
  <Provider store={store}>
    <RootContainer />
  </Provider>
), document.getElementById('root'));

setInterval(() => store.dispatch({
  type: ActionTypes.NEW_TIME,
  data: (new Date()).getTime()
}), 1000);
