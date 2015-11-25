// reducers/masterReducer.js
import { combineReducers } from 'redux';


function testRun(state = [], action) {
    if (action !== null) {
        return state;
    }
}


const masterReducer = combineReducers({
    testRun: testRun
});

export default masterReducer;
