import { h } from "preact";

import { Header } from './Header';
import { Window, WindowContent } from "./Window";
import { Store } from '..';
import { useContext } from 'preact/hooks';
import { EditorPaneGroup } from './EditorPaneGroup';

export const App = (): h.JSX.Element => {

    const store = useContext(Store);

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
            <WindowContent>
                <EditorPaneGroup></EditorPaneGroup>
            </WindowContent>             
    </Window>
}
