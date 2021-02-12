// import { MenuItem } from 'electron';
import { reaction } from 'mobx';
import { Component, h } from 'preact';
import { RootStore } from '../../store/rootStore';
import { IMenuItemRenderer } from "../../../plugins/helpers/IMenuItemRenderer";
import { AbstractStoryModifier } from '../../../plugins/helpers/AbstractModifier';
import { deepObserve, IDisposer } from 'mobx-utils';

export interface IItemPropertiesViewProperties {
    // template: IMenuTemplate[] | undefined
    store: RootStore
}

export class ItemPropertiesView extends Component<IItemPropertiesViewProperties> {

    private disposer: IDisposer;

    constructor(props: IItemPropertiesViewProperties) {

        super(props);
        const obj = props.store.
                storyContentObjectRegistry.
                getValue(props.store.uistate.selectedItems.first);
        // this.disposer = deepObserve([obj, props.store.uistate.selectedItems], () => this.setState({}));

        this.disposer = reaction(
            () => {
                const obj = props.store.
                storyContentObjectRegistry.
                getValue(props.store.uistate.selectedItems.first);
                const res = obj?.modifiers;
                const conns = obj?.connections;

                const thingsToWatch = [
                    ...props.store.uistate.selectedItems.ids,
                    res?.length,
                    conns?.length
                ];

                return thingsToWatch;
            },
            () => {
                this.setState({});
            }
        );
    }

    render({ store }: IItemPropertiesViewProperties): h.JSX.Element {
        const res = store.
        storyContentObjectRegistry.
        getValue(store.uistate.selectedItems.first);
        
        const template = res?.menuTemplate;

        let menuItems: h.JSX.Element[] = [];
        if (template) {
            menuItems = template.map(item => {
                const ret = store.pluginStore.getNewInstance(`internal.pane.${item.type}`);
                if (ret) return (ret as IMenuItemRenderer).render(item)
                else return <p>NUILLL</p>
            })
        }

        const onDrop = (event: DragEvent) => {
            const data = event.dataTransfer?.getData("text");
            if (data) { // /\w+\.modifier\w+\./gm.test(data)
                const instace = store.pluginStore.getNewInstance(data) as AbstractStoryModifier;
                if (instace) res?.addModifier(instace);
            }
        }

        return <form onSubmit={e => e.preventDefault()} onDrop={onDrop}>
            { (menuItems.length !== 0) ? menuItems : null }
        </form>
    }

    componentWillUnmount(): void {
        this.disposer();
    }
}


// switch(item.type) {
//     case "text": {
//         return <div class="form-group-item">
//                 <label>{item.label}</label>
//                 <input
//                     class="form-control"
//                     type="text"
//                     placeholder="Insert text here…"
//                     value={item.value()}
//                     onInput={(e: Event) => {
//                         const target = e.target as HTMLInputElement
                        
//                         if (item.valueReference && target.value && target.value !== item.value().length) {
//                             item.valueReference(target.value);
//                         }
//                     }}
//                     ></input>
//             </div>
//     }
//     case "textarea": {
//         return <div class="form-group-item">
//             <label>{item.label}</label>
//     <textarea class="form-control" rows={5}  onInput={(e: Event) => {
//                         const target = e.target as HTMLInputElement
                        
//                         if (item.valueReference && target.value && target.value !== item.value().length) {
//                             item.valueReference(target.value);
//                         }
//                     }}>{item.value() as string}</textarea>
//         </div>
//     }
//     // this is specifically an edge-list!!!
//     case "table": {
//         return <ConnectionTableView store={store} item={item} />
//     }
//     case "dropdown": {
//         return <div class="form-group-item">
//             <label>{item.label}</label>
//             <select
//             class="form-control"
//                 name={item.label.toLowerCase()}
//                 id={item.label.toLowerCase()}
//                 size={1}
//                 onInput={(e: Event) => {
//                     const target = e.target as HTMLSelectElement;

//                     if (item.valueReference && target) {
//                         if (target.selectedOptions.length === 1) {
//                             item.valueReference(target.selectedOptions.item(0)?.value);
//                         }
//                     }
//                 }}
//             >
//             {
//                 item.options?.map(e => (
//                     <option value={e}>{e}</option>
//                 ))
//             }
//             </select>
//         </div>
//     }
//     case "button": {
//         return <div class="form-group-item">
//             <button class="btn btn-default" onClick={
//                 (e) => {
//                     let _type = "";
//                     let _dir = "";
//                     const contextMenu = new Menu();
//                     ["flow","reaction","data"].forEach(f => {
//                         contextMenu.append(new MenuItem({
//                             label: f,
//                             click: () => _type = f
//                         }))
//                     });
//                     contextMenu.popup({
//                         window: remote.getCurrentWindow(),
//                         x: e.x,
//                         y: e.y
//                     });
//                     const contextMenu2 = new Menu();
//                     ["in","out"].forEach(f => {
//                         contextMenu2.append(new MenuItem({
//                             label: f,
//                             click: () => _dir = f
//                         }))
//                     });
//                     contextMenu2.popup({
//                         window: remote.getCurrentWindow(),
//                         x: e.x,
//                         y: e.y
//                     });

//                     if (item && item.valueReference) item.valueReference(_type, _dir);
//                 }
//             }>{item.label}</button>
//         </div>
//     }
//     case "file-selector": {
//         return <div class="form-group-item">
//             <input class="form-control" type="text" value={item.value()}></input>
//             <button class="btn btn-default" onClick={() => {
//                 const file = remote.dialog.showOpenDialogSync(
//                     remote.getCurrentWindow(), {
//                         title: "Open scene",
//                         properties: [
//                             "openFile"
//                         ]
//                     }
//                 );

//                 if (file && file.length === 1 && item.valueReference) item.valueReference(file[0]);
//             }}>
//                 load Scene
//             </button>
//         </div>
//     }
//     default: return <li>Empty</li>;
// }