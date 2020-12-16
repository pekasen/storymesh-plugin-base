import { h } from "preact";

import { Header } from './Header';
import { ThemedWindowContent, Window } from "./Window";
import { Store } from '..';
import { useContext, useEffect, useState } from 'preact/hooks';
import { EditorPaneGroup } from './EditorPaneGroup';
import { NotificationView } from './NotificationView/NotificationView';
import { reaction } from 'mobx';

export const App = (): h.JSX.Element => {
    const [, setState] = useState({});
    const store = useContext(Store);
    useEffect(() => {
        const disposer = reaction(
            () => [store, store.uistate.windowProperties.title, store.userPreferences.theme],
            (root) => {
                console.log("changed@root", root);
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
                        console.log("Hello");
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
                <EditorPaneGroup></EditorPaneGroup>
            </ThemedWindowContent>             
    </Window>
}
