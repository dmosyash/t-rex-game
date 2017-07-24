import React, { Component } from 'react';
import Game from './Game.js';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Collect all the Mammals</h2>
        </div>
        <br />
        <br />
        <Game type="sameAndMany" width={'70%'}/>
      </div>
    );
  }
}

export default App;
