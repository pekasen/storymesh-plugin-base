import { reaction } from 'mobx';
import { Component, h } from 'preact';

import { List } from "../store/List";
import { UIStore } from "../store/UIStore";

import { ListSearchView } from './ListSearchView';
import { ListItemView } from './ListItemView';

interface IToolbarProps {
    list: List
    uistate: UIStore
}

export class Toolbar extends Component<IToolbarProps, {}> {

    constructor(props: IToolbarProps) {

        props.uistate.setSearchResults(
            props.list.members
        );
        
        const updateSearch = () => {
            if (props.uistate.term === "") {
                props.uistate.setSearchResults(
                    props.list.members
                );
            } else {
                const search = props.list.members.filter(item => (
                    item.name.match(props.uistate.term) ||
                    item.type?.match(props.uistate.term)
                ));
                if (props.uistate.searchResults !== search) {
                    props.uistate.setSearchResults(
                      search  
                    );
                }
            }
            this.setState({});
        };

        super(props);

        reaction(() => (props.uistate.term), updateSearch);
        reaction(() => props.list.members, updateSearch);
    }

    render({ list, uistate }: IToolbarProps) {
        return <ul class="list-group">
                <ListSearchView list={list.members} uistate={uistate}></ListSearchView>
                {
                    (uistate.searchResults.length !== 0) ?
                        uistate.searchResults.map(x => (
                        <ListItemView
                            item={x}
                            onClick={() => {x.changeName("Hello")}}
                            onDblClick={() => console.log("Open")}>
                        </ListItemView>
                    )):
                        <li>Nothing</li>

                }
                <button onClick={() => {list.addMember("Christian", "Prof")}}>Add</button>
        </ul>
    }
}
