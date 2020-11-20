// import { MenuItem } from 'electron';
import { remote } from 'electron/renderer';
const { Menu, MenuItem } = remote;

import { reaction } from 'mobx';
import { Component, h } from 'preact';
import { RootStore } from '../../store/rootStore';
import { ConnectionTableView } from './ConnectionTableView';

export interface IItemPropertiesViewProperties {
    // template: IMenuTemplate[] | undefined
    store: RootStore
}

export class ItemPropertiesView extends Component<IItemPropertiesViewProperties> {

    constructor(props: IItemPropertiesViewProperties) {
        super(props);
        reaction(
            () => [...props.store.uistate.selectedItems.ids],
            () => {
                this.setState({});
            }
        );
    }

    render({ store }: IItemPropertiesViewProperties): h.JSX.Element {
        const template = (() => {
            const res = store.
            storyContentObjectRegistry.
            getValue(store.uistate.selectedItems.first);
            
            return res?.
            menuTemplate;
        })()

        let menuItems: h.JSX.Element[] = [];
        if (template) {
            menuItems = template.map(item => {
                switch(item.type) {
                    case "text": {
                        return <div class="form-group-item">
                                <label>{item.label}</label>
                                <input
                                    class="form-control"
                                    type="text"
                                    placeholder="Insert text here…"
                                    value={item.value()}
                                    onInput={(e: Event) => {
                                        const target = e.target as HTMLInputElement
                                        
                                        if (item.valueReference && target.value && target.value !== item.value().length) {
                                            item.valueReference(target.value);
                                        }
                                    }}
                                    ></input>
                            </div>
                    }
                    case "textarea": {
                        return <div class="form-group-item">
                            <label>{item.label}</label>
                    <textarea class="form-control" rows={5}  onInput={(e: Event) => {
                                        const target = e.target as HTMLInputElement
                                        
                                        if (item.valueReference && target.value && target.value !== item.value().length) {
                                            item.valueReference(target.value);
                                        }
                                    }}>{item.value() as string}</textarea>
                        </div>
                    }
                    // this is specifically an edge-list!!!
                    case "table": {
                        return <ConnectionTableView store={store} item={item} />
                    }
                    case "dropdown": {
                        return <div class="form-group-item">
                            <label>{item.label}</label>
                            <select
                            class="form-control"
                                name={item.label.toLowerCase()}
                                id={item.label.toLowerCase()}
                                size={1}
                                onInput={(e: Event) => {
                                    const target = e.target as HTMLSelectElement;

                                    if (item.valueReference && target) {
                                        if (target.selectedOptions.length === 1) {
                                            item.valueReference(target.selectedOptions.item(0)?.value);
                                        }
                                    }
                                }}
                            >
                            {
                                item.options?.map(e => (
                                    <option value={e}>{e}</option>
                                ))
                            }
                            </select>
                        </div>
                    }
                    default: return <li>Empty</li>;
                }
            })
        }
        return <form onSubmit={e => e.preventDefault()}>
            { (menuItems.length !== 0) ? menuItems : null }
        </form>
    }
}


