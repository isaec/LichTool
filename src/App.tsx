import { Route, Routes } from "solid-app-router";
import { Component } from "solid-js";

import { RenderDemo } from "@routes";

const App: Component = () => (
  <Routes>
    <Route path="/renderdemo" component={RenderDemo} />
  </Routes>
);

export default App;
