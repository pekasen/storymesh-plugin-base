import { h } from 'preact';
import { ListItem } from "../store/ListItem";
import { UIStore } from "../store/UIStore";

interface IListSearchViewProps {
    uistate: UIStore;
    list: ListItem[];
}

export const ListSearchView = ({ uistate }: IListSearchViewProps): h.JSX.Element => {
    const update = (e?: h.JSX.TargetedEvent<HTMLInputElement>) => {
        if (e) {
            const element = e.currentTarget as HTMLInputElement;
            const term = element.value;
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
        ></input>
    </li>;
};
