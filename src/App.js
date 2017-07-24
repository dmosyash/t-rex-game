import React, { Component } from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router'
import Header from './Header.js'
import Game from './Game.js';
import './App.css';

const Container = (props) => <div>
  <Header />
  <br />
  <br />
  {props.children}
</div>
const Simplest = (props) => <Game type="sameAndMany" width={'70%'} />
const Medium = (props) => <Game type="oneAndOne" width={'70%'} />
const Toughest = (props) => <Game type="oneAndMany" width={'70%'} />

class App extends Component {
  render() {
    return (
      <div className="App">
        <Router history={hashHistory}>
          <Route path='/' component={Container}>
            <IndexRoute component={Simplest} />
            <Route path='medium' component={Medium} />
            <Route path='tough' component={Toughest} />
          </Route>
        </Router>
        {/* <Game type="sameAndMany" width={'70%'}/> */}
      </div>
    );
  }
}

export default App;
