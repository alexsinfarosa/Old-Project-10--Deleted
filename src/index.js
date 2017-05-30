import React from "react";
import ReactDOM from "react-dom";

// Components
import App from "components/App";

// Styles
import "styles/index.css";
import "normalize.css";
import "font-awesome/css/font-awesome.css";

// Mobx
import store from "stores";
import { Provider } from "mobx-react";

import registerServiceWorker from "./registerServiceWorker";

// fetch data
// const fetcher = url => window.fetch(url).then(response => response.json());
// const appStore = new AppStore(fetcher);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
registerServiceWorker();
