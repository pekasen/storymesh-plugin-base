// import { MenuItem } from 'electron';
import { reaction } from 'mobx';
import { FunctionalComponent, h } from 'preact';
import { RootStore } from '../../store/rootStore';
import { IMenuItemRenderer } from "../../../plugins/helpers/IMenuItemRenderer";
import { IMenuTemplate } from '../../utils/PlugInClassRegistry';
import { useContext, useEffect, useState } from 'preact/hooks';
import { Store } from '../..';

export interface IItemPropertiesViewProperties {
    // template: IMenuTemplate[] | undefined
    store: RootStore
}

export const SideBar: FunctionalComponent<{items: IMenuTemplate[]}> = ({ items }) => {
    const { pluginStore } = useContext(Store);
    const menuItems = items.map(item => {
        const ret = pluginStore.getNewInstance(`internal.pane.${item.type}`);
        if (ret) return (ret as IMenuItemRenderer).render(item)
        else return <p>NUILLL</p>
    });
    const onDrop = (event: DragEvent) => {
        const data = event.dataTransfer?.getData("text");
        if (data) {
            // const instace = pluginStore.getNewInstance(data) as AbstractStoryModifier;
            // if (instace) res?.addModifier(instace);
        }
    };

    return <form onSubmit={e => e.preventDefault()} onDrop={onDrop}>
            { (menuItems.length !== 0) ? menuItems : null }
    </form>
}

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

// export class ItemPropertiesView extends Component<IItemPropertiesViewProperties> {

//     // private disposer: IDisposer;

//     constructor(props: IItemPropertiesViewProperties) {

//         super(props);
//         // const obj = props.store.
//         //         storyContentObjectRegistry.
//         //         getValue(props.store.uistate.selectedItems.first);
//         // // this.disposer = deepObserve([obj, props.store.uistate.selectedItems], () => this.setState({}));

//         // this.disposer = reaction(
//         //     () => {
//         //         const obj = props.store.
//         //         storyContentObjectRegistry.
//         //         getValue(props.store.uistate.selectedItems.first);
//         //         const res = obj?.menuTemplate;
//         //         // const conns = obj?.connections;

//         //         const thingsToWatch = [
//         //             ...props.store.uistate.selectedItems.ids,
//         //             res?.length,
//         //             // conns?.length
//         //         ];

//         //         return thingsToWatch;
//         //     },
//         //     (a) => {
//         //         console.log("watching", a)
//         //         // this.setState({});
//         //         this.forceUpdate()
//         //     }, {
//         //         delay: 50
//         //     }
//         // );
//     }

//     render(): h.JSX.Element {
//         const { storyContentObjectRegistry, uistate } = useContext(Store);
//         const res = storyContentObjectRegistry.
//         getValue(uistate.selectedItems.first);
        
//         if (res) {
//             return <SideBar items={res?.menuTemplate} />
//         } else return <div></div>

//         // let menuItems: h.JSX.Element[] = [];
//         // if (template) {
//         //     menuItems = template.map(item => {
//         //         const ret = store.pluginStore.getNewInstance(`internal.pane.${item.type}`);
//         //         if (ret) return (ret as IMenuItemRenderer).render(item)
//         //         else return <p>NUILLL</p>
//         //     })
//         // }

//         // const onDrop = (event: DragEvent) => {
//         //     const data = event.dataTransfer?.getData("text");
//         //     if (data) { // /\w+\.modifier\w+\./gm.test(data)
//         //         const instace = store.pluginStore.getNewInstance(data) as AbstractStoryModifier;
//         //         if (instace) res?.addModifier(instace);
//         //     }
//         // }

//         // return <form onSubmit={e => e.preventDefault()} onDrop={onDrop}>
//         //     { (menuItems.length !== 0) ? menuItems : null }
//         // </form>
//     }

//     componentWillUnmount(): void {
//         // this.disposer();
//     }
// }
