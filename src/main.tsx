import "reflect-metadata";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { configureContainer } from "./lib/di/container";
configureContainer();

createRoot(document.getElementById("root")!).render(<App />);
