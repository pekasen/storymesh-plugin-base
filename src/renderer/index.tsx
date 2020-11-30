// eslint-disable-next-line @typescript-eslint/no-unused-vars

import { App } from "./components/App";
import { render, h, createContext } from "preact";
import { registerHandlers } from './utils/registerHandlers';
import { RootStore } from './store/rootStore';

export const rootStore = new RootStore();
export const Store = createContext(rootStore);
// export const webGLEngine = new BABYLON.Engine(new HTMLCanvasElement());

registerHandlers();

const root = document.getElementById("preact-root") as HTMLElement;
render(
    <Store.Provider value={rootStore}>
        <App />
    </Store.Provider>,
    root
);
