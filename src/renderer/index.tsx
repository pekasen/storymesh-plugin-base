import { render, h } from "preact";
import { App } from "./components/App";

console.log("Hello Console!");
const root = document.getElementById("preact-root") as Element;
render(
    <App />,
    root
);