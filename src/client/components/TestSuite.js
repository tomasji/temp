import { Component } from 'react';
/*eslint-disable no-unused-vars*/
import React from 'react';
/*eslint-enable no-unused-vars*/
import { connect } from 'react-redux';


class TestSuite extends Component {
    render() {
        return (
            <div id="container" >
                <h1>Hello, World!</h1>
            </div>
        );
    }
}



function select(state) {
    return {
        restaurants: state.restaurants
    };
}


// Wrap the component to inject dispatch and state into it
export default connect(select)(TestSuite);
