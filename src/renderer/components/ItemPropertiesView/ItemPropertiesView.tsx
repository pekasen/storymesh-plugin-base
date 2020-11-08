import { Component, h } from 'preact';
import { UIStore } from '../../store/UIStore';
import { IMenuTemplate } from '../../utils/PlugInClassRegistry';

export interface IItemPropertiesViewProperties {
    template: IMenuTemplate[] | undefined
    store: UIStore
}

export class ItemPropertiesView extends Component<IItemPropertiesViewProperties> {

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
                                    value={item.valueTemplate()}
                                    onInput={(e: Event) => {
                                        const target = e.target as HTMLInputElement
                                        
                                        if (item.valueReference && target.value && target.value !== item.valueTemplate()) {
                                            console.log(item.valueReference, item.valueTemplate())
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
// TypeError: 'caller', 'callee', and 'arguments' properties may not be accessed on strict mode functions or the arguments objects for calls to them
//     at Function.invokeGetter (<anonymous>:1:142)
//     at Object._TextObject.getName [as valueTemplate] (/Users/philipp/repos/ngwebs-editor/dist/plugins/TextObject.js:85:26)
//     at Object.onChange [as changefalse] (/Users/philipp/repos/ngwebs-editor/dist/renderer/components/ItemPropertiesView/ItemPropertiesView.js:23:79)
//     at HTMLInputElement.P (/Users/philipp/repos/ngwebs-editor/node_modules/preact/dist/preact.js:1:4283)