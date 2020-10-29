import { reaction } from 'mobx';
import { Component, h } from 'preact';

import { List } from "../store/List";
import { UIStore } from "../store/UIStore";

import { ListSearchView } from './ListSearchView';
import { ListItemView } from './ListItemView';

interface IToolbarProps {
    list: List
    uistate: UIStore
    hidden: boolean
}

export class Toolbar extends Component<IToolbarProps> {

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

        const toggleSidebar = () => {
            this.setState({})
        };
 
        super(props);

        reaction(() => (props.uistate.term), updateSearch);
        reaction(() => (props.list.members), updateSearch);
        reaction(() => (props.hidden), toggleSidebar);
    }

    render({ list, uistate, hidden }: IToolbarProps): h.JSX.Element {
        return <div class={"pane pane-sm sidebar" + ((hidden) ? " hide" : " unhide")} style="transition: all 2s;">
            <ul class={"list-group scroll"}>
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
                        <li class="list-group-item">
                            <strong>Nothing's found here, yo.</strong>
                        </li>

                }
                <li class="list-group-footer">Hello</li>
                <li class="list-group-item">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        
                        const name = document.getElementById("name") as HTMLInputElement;
                        const type = document.getElementById("type") as HTMLInputElement;

                        if (name && name.value) {
                            list.addMember(name.value, type.value || "");
                            console.log(name.value, type.value);
                        }
                    }}>
                    <div class="form-group">
                        <label>Name</label><br></br>
                        <input id="name" type="text" class="form-control" placeholder="Name"></input>
                    </div>
                    <div class="form-group">
                        <label>Type</label><br></br>
                        <input id="type" type="text" class="form-control" placeholder="Type"></input>
                    </div>
                    <div class="form-actions">
                        <button class="btn btn-form btn-primary">Add</button>
                    </div>
                </form> 
            </li>   
        </ul>
        
        </div>
    }
}
