import { h } from 'preact';
import { ListItem } from "../store/ListItem";
import { UIStore } from "../store/UIStore";

interface IListSearchViewProps {
    uistate: UIStore;
    list: ListItem[];
}

export const ListSearchView = ({ uistate }: IListSearchViewProps) => {
    const update = (e?: any) => {
        if (e) {
            let term = (e.currentTarget.value);
            uistate.setSearchTerm(term || "");
        }
    };

    return <li class="list-group-header">
        <input
            class="form-control"
            type="text"
            placeholder="Search for someone"
            onInput={e => {
                update(e);
            }}
            onChange={e => {
                update(e);
            }}
        ></input>
    </li>;
};
