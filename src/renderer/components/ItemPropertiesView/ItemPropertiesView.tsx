import { reaction } from 'mobx';
import { Component, h } from 'preact';
import { UIStore } from '../../store/UIStore';
import { IMenuTemplate } from '../../utils/PlugInClassRegistry';

export interface IItemPropertiesViewProperties {
    template: IMenuTemplate[] | undefined
    store: UIStore
}

export class ItemPropertiesView extends Component<IItemPropertiesViewProperties> {

    constructor(props: IItemPropertiesViewProperties) {
        super(props);
        reaction(
            () => props.store.selectedItem,
            () => {
                this.setState({});
            }
        );
    }

    render({ template, store }: IItemPropertiesViewProperties): h.JSX.Element {
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
                                        
                                        if (item.valueReference && target.value && target.value !== item.value()) {
                                            console.log(item.valueReference, item.value())
                                            item.valueReference(target.value);
                                        }
                                    }}
                                    ></input>
                            </div>
                    }
                    case "textarea": {
                        return <div class="form-group-item">
                            <label>{item.label}</label>
                            <textarea class="form-control" rows={5}></textarea>
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
