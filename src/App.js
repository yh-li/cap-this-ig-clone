import React, { useState, useEffect } from "react";
import "./App.css";
import Home from "./Home";
import NotFound from "./NotFound";
import SinglePostPage from "./SinglePostPage";
import SingleUserPage from "./SingleUserPage";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/posts/:postId" component={SinglePostPage} />
        <Route exact path="/users/:userId" component={SingleUserPage} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

export default App;
