// import { MenuItem } from 'electron';
import { reaction } from 'mobx';
import { FunctionalComponent, h } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import { Store } from '../..';
import { SideBar } from "preact-sidebar";

export const ItemPropertiesView: FunctionalComponent = () => {
    const { storyContentObjectRegistry, uistate } = useContext(Store);
    
    const res = storyContentObjectRegistry.
    getValue(uistate.selectedItems.first);
    const [state, setState] = useState({
        items: res?.menuTemplate
    });

    useEffect(() => {
        const disposer = reaction(
            () => (uistate.selectedItems.first),
            (id: string) => {
                const items = storyContentObjectRegistry.getValue(id)?.menuTemplate;
                if (items !== undefined && items.length >= 0) {
                    setState({
                        items: items
                    });
                }
            }
        );

        return () => {
            disposer();
        }
    })
    
    if (state.items) {
        return <SideBar items={state.items} />
    } else return <div></div>
}
