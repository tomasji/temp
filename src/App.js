import React, { Component } from 'react';
import './App.css';

class NewItem extends Component {
  render() {
    const { addItem } = this.props;
    return (
      <div>
        <form onSubmit={ (e) => {
          e.preventDefault();
          addItem(this.refs.new_item.value);
          this.refs.new_item.value = '';
        }}>
          <input type='text' ref='new_item' />
          <button type="submit">Add Item</button>
        </form>
      </div>
    );
  }
}

class ItemList extends Component {
  render() {
    const { items, removeItem } = this.props;
    return (
      <ul>
        { items.map((item, index) => <li className='rm' key={index} onClick={()=>removeItem(index)}>{item}</li>) }
      </ul>
    );
  }
}

class Todo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: ['Koupit maso', 'Vypit pivo']
    };
  }

  render() {
    const items = this.state.items;
    return (
      <div>
        <h1>Todo List ({items.length})</h1>
        <NewItem
          addItem={ (item) => { if (item !== '') { this.setState({ items: items.concat([item]) }) } } }
        />
        <ItemList
          items={ items }
          removeItem={ (i) => this.setState({ items: items.slice(0,i).concat(items.slice(i+1)) }) }
        />
      </div>
    );
  }
}


class App extends Component {
  render() {
    return (
      <div className="App">
        <Todo />
      </div>
    );
  }
}

export default App;
