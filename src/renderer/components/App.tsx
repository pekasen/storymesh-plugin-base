import { h } from "preact";

import { Header } from './Header';
import { ThemedWindowContent, Window } from "./Window";
import { Store } from '..';
import { useContext, useEffect, useState } from 'preact/hooks';
import { EditorPaneGroup } from './EditorPaneGroup';
import { NotificationView } from './NotificationView/NotificationView';
import { reaction } from 'mobx';
import Logger from "js-logger";

export const App = (): h.JSX.Element => {
    const [, setState] = useState({});
    const store = useContext(Store);
    useEffect(() => {
        const disposer = reaction(
            () => [
                // doesn't ever trigger, remove:
                // store,
                // TODO: defer these both reactions to the appropriate component
                store.uistate.windowProperties.title,
                store.userPreferences.theme],
            (root) => {
                Logger.info("changed@root", root);
                setState({})
            }
        )

        return () => {
            disposer();
        }
    });

    return <Window>
            <Header
                title={store.uistate.windowProperties.title}
                leftToolbar={[
                <button class="btn btn-default"
                    onClick={() => {
                        Logger.info("Hello");
                        store.uistate.windowProperties.sidebarPane.toggleHidden();
                    }}>
                    <span class={"icon icon-left-dir"}></span>
                </button>]}
                rightToolbar={[
                    <button class="btn btn-default pull-right"
                    onClick={() => {
                        store.uistate.windowProperties.previewPane.toggleHidden();
                    }}>
                    <span class={"icon icon-right-dir"}></span>
                </button>
                ]}
            ></Header>
            <ThemedWindowContent>
                <NotificationView />
                <EditorPaneGroup />
            </ThemedWindowContent>             
    </Window>
}
