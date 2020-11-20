// eslint-disable-next-line @typescript-eslint/no-unused-vars

import { App } from "./components/App";
import { render, h, createContext } from "preact";
import { registerHandlers } from './utils/registerHandlers';
import { RootStore } from './store/rootStore';

export const rootStore = new RootStore();
export const Store = createContext(rootStore);
registerHandlers();

const root = document.getElementById("preact-root") as HTMLElement;
render(
    <Store.Provider value={rootStore}>
        <App store={rootStore}></App>
    </Store.Provider>,
    root
);
