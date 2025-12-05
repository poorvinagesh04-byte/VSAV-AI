import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css"; // adjust or remove if you don't have a global stylesheet

const rootElement =
    document.getElementById("root") ||
    (() => {
        const el = document.createElement("div");
        el.id = "root";
        document.body.appendChild(el);
        return el;
    })();

createRoot(rootElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);