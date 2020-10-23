import { autorun } from 'mobx';
import { Component, h } from 'preact';
import { List, ListItem, UIStore } from '..';

export interface IListItem {
    name: string
    type?: string
}

interface IToolbarState {
    list: IListItem[]
}

interface IToolbarProps {
    list: List
    uistate: UIStore
}

export class Toolbar extends Component<IToolbarProps, IToolbarState> {

    constructor(props: IToolbarProps) {

        super(props);

        autorun(() => {
            console.log("update ", props.list.members);
            props.uistate;
            this.props.list.members.map(e => {
                autorun(() => {
                    console.log("update " + e.name, e)
                    this.forceUpdate();
                });
            })
            this.forceUpdate();
        });
    }

    render({ list, uistate }: IToolbarProps, state: IToolbarState) {
        return <ul class="list-group">
                <ListSearchView list={list.members} uistate={uistate}></ListSearchView>
                {uistate.searchResults.map(x => (
                   <ListItemView item={x} onClick={() => {x.changeName("Hello")}}></ListItemView>
                ))}
                <button onClick={() => {list.addMember("Christian", "Prof"); console.log(list)}}>Add</button>
        </ul>
    }
    
    // shouldComponentUpdate({ list }: IToolbarProps, nextState: IToolbarState) {
    //     console.log(list);
    //     return !(this.state === nextState) || ;
    // }
}

interface  IListSearchViewProps{
    uistate: UIStore
    list: ListItem[]
}

const ListSearchView = ({ uistate, list }: IListSearchViewProps) => (
    <li class="list-group-header">
        <input
            class="form-control"
            type="text"
            placeholder="Search for someone"
            onChange={e =>{
                uistate.setSearchResults(list.filter(i => {
                    let term = e.currentTarget.value;
                    if (term !== "") {
                        return i.name.match(term) ||
                        i.type?.match(term)

                    } else {
                        return list
                    }
                }))
            }}
            // onDrop={
            //     function (e) {
            //         e.preventDefault();

            //         const data = JSON.parse(e.dataTransfer?.getData("text") || "");
            //         this.value = data.name;
            //         this.click()
            //         // this.setAttribute("value", data.name);
            //     }
            // } onDragOver={
            //     e => {e.preventDefault()}
            // }    
        ></input>
    </li>
);

interface IListItemViewProps {
    item: ListItem
    onClick: () => void
}

const ListItemView = ({ item, onClick }: IListItemViewProps) => (
    <li 
    class="list-group-item" 
    onClick={onClick} 
    draggable={true} 
    onDragStart={e => {
        if (e.target) {
            e.dataTransfer?.setData("text", JSON.stringify(item));
        }
    }}>
        <span class="icon icon-user img-circle media-object pull-left"></span>
        <div class="media-body">
            <strong>{`${item.name}`}</strong><br></br>
            {`${item.type ? item.type : ""}`}
        </div>
    </li>
);
