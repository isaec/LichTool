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
      <Toaster
        toastOptions={{
          duration: 2000,
          style: {
            "background-color": "#2c343f",
            color: "#e8eaed",
          },
        }}
      />
    </Router>
  ),
  document.getElementById("root") as HTMLElement
);
