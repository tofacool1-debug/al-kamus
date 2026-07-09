import React from "react";
import ReactDOM from "react-dom/client";
import { AppProvider } from "../Folder baru/context/AppContext";
import { PremiumProvider } from "../Folder baru/context/PremiumContext";
import HomeScreen from "../Folder baru/app/index";

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <AppProvider>
      <PremiumProvider>
        <HomeScreen />
      </PremiumProvider>
    </AppProvider>
  );
}
