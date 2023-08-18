import { useState } from 'react';
import './App.css';
import Login from './mycomp/login'
import Home from './mycomp/Home'
import Lobby from './mycomp/lobby'
import Register from './mycomp/Register'

import {
  BrowserRouter as Router,Switch,
  Route,
  Link,
} from "react-router-dom";

function App() {
  return (
    <Router>
    <Switch>
          <Route exact path="/">
            <Login/>
          </Route>
          <Route path="/lobby/:roomid/:username">
            <Lobby />
          </Route>
          <Route path="/:username/:databaseid" render={(props)=> <Home />}/>
          <Route path="/register" render={(props)=> <Register />} />
    </Switch>
    </Router>
  );
}

export default App;