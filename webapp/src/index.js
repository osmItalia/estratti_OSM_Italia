import React from "react";
import ReactDOM from "react-dom";
import {createInstance, MatomoProvider} from "@datapunt/matomo-tracker-react";
import App from "./App";
import config from "./configuration.json";

const MATOMO_INSTANCE = createInstance(config.matomo);

ReactDOM.render((
  <MatomoProvider value={MATOMO_INSTANCE}>
    <App />
  </MatomoProvider>
), document.getElementById("root"));
