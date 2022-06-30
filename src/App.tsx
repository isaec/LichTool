import { Route, Routes } from "solid-app-router";
import { Component } from "solid-js";

import { RenderDemo, Search } from "@routes";

const App: Component = () => (
  <Routes>
    <Route path="/renderdemo" component={RenderDemo} />
    <Route path="/search" component={Search} />
  </Routes>
);

export default App;
