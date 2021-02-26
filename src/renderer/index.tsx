import "preact/debug";
import { App } from "./components/App";
import { render, h, createContext } from "preact";
import { registerHandlers } from './utils/registerHandlers';
import { RootStore } from './store/rootStore';
import { AbstractStoryObject } from '../plugins/helpers/AbstractStoryObject';
import Logger from "js-logger";

// setup logger
Logger.useDefaults({
    defaultLevel: Logger.INFO,
    formatter: function(messages, context) {
        // prefix each log message with a timestamp.
        messages.unshift(new Date().toUTCString())
    }
});

export const rootStore = {
    root: new RootStore(),
    _loadingCache: new Map<string, AbstractStoryObject>()
};
export const Store = createContext(rootStore.root);

registerHandlers();

const root = document.getElementById("preact-root") as HTMLElement;
rootStore.root.notifications.postNotification("Hello from NWebSCore!", this);
render(
    <Store.Provider value={rootStore.root}>
        <App />
    </Store.Provider>,
    root
);
