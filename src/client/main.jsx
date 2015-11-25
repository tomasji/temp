// main.jsx

import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import masterReducer from './reducers/masterReducer';
import TestSuite from './components/TestSuite';
import React from 'react';

const store = createStore(masterReducer);

render(<Provider store={store}><TestSuite getState={store.getState}/></Provider>, document.getElementById('app'));
