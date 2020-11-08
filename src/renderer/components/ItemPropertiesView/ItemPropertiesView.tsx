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
            menuItems = template.map(item => (
                <li>{item.label}</li>
            ))
        }
        return <ul>
            { (menuItems.length !== 0) ? menuItems : null }
        </ul>
    }
}