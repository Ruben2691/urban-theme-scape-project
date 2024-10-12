import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { restoreCSRF, csrfFetch } from "./store/csrf";
import App from "./App";
import "./index.css"; // Importing your global styles
import configureStore from "./store"; // Import the configured store
import * as sessionActions from './store/session'; // <-- ADD THIS LINE

const store = configureStore();






if (import.meta.env.MODE !== "production") {
  restoreCSRF();

  window.csrfFetch = csrfFetch;
  window.store = store;
  window.sessionActions = sessionActions; // <-- ADD THIS LINE
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
