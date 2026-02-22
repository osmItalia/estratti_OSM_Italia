import React from "react";
import ReactDOM from "react-dom";
import {createInstance, MatomoProvider} from "@datapunt/matomo-tracker-react";
import {I18nextProvider} from "react-i18next";
import i18n from './i18n';
import App from "./App";
import config from "./configuration.json";

const MATOMO_INSTANCE = createInstance(config.matomo);

ReactDOM.render((
  <MatomoProvider value={MATOMO_INSTANCE}>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </MatomoProvider>
), document.getElementById("root"));
