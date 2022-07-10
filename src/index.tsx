/* @refresh reload */
import { render } from "solid-js/web";

import "./index.scss";
import App from "./App";
import { Router } from "solid-app-router";
import { Toaster } from "solid-toast";

render(
  () => (
    <Router>
      <App />
      <Toaster />
    </Router>
  ),
  document.getElementById("root") as HTMLElement
);
