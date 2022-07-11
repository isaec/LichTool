import { Navigate, Route, Routes } from "solid-app-router";
import { Component } from "solid-js";

import { RenderDemo, Search, Root } from "@routes";
import View from "./routes/View";

const App: Component = () => (
  <Routes>
    <Route path="/" component={Root} />
    <Route path="/renderdemo" component={RenderDemo} />
    <Route path="/search" component={Search} />
    <Route path="/view" component={() => <Navigate href="/search" />} />
    <Route path="/view/*id" component={View} />
  </Routes>
);

export default App;
