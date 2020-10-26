import { autorun, IReactionDisposer, observe, Reaction, reaction } from 'mobx';
import { Component, h } from 'preact';
import { useState } from "preact/hooks";
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
        this.props = props;

        reaction(() => (props.uistate.term), updateSearch);
        reaction(() => props.list.members, updateSearch);

        // observe(props.uistate, "term", (change) => console.log(change));
    }

    render({ list, uistate }: IToolbarProps, state: IToolbarState) {
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

interface  IListSearchViewProps{
    uistate: UIStore
    list: ListItem[]
}

const ListSearchView = ({ uistate }: IListSearchViewProps) => {
    // const [state, setState] = useState({});
    const update = (e?: any) => { 
        if (e) {
            let term = (e.currentTarget.value);
            uistate.setSearchTerm(term || "");
        }
        // setState({});
    };

    return <li class="list-group-header">
        <input
            class="form-control"
            type="text"
            placeholder="Search for someone"
            onInput={e =>{
                update(e);
            }}
            onChange={e =>{
                update(e);
            }}   
        ></input>
    </li>
};

interface IListItemViewProps {
    item: ListItem
    onClick?: () => void
    onDblClick?: () => void
}

export class ListItemView extends Component<IListItemViewProps, {}>{

    reaction: IReactionDisposer

    constructor (props: IListItemViewProps) {
        super(props);

        this.reaction = reaction(
            () => ({...props.item}),
            (name, type?) => {
                this.setState({});
            }
        )
        // autorun(() => {
        //     props.item;
        //     console.log("update", this);
        //     // this.setState({});
        // }, {delay: 25});
    }
    render({item, onClick }: IListItemViewProps) {
        return <li 
        class="list-group-item" 
        onClick={onClick} 
        // onDblClick={onDblClick}
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
    }
}

// const ListItemView = ({ item }: IListItemViewProps) => {
//     const [state, setState] = useState({});
//     autorun(() => {
//         console.log("update", item);
//         setState({});
//     }, {delay: 25});

//     return <li 
//         class="list-group-item" 
//         // onClick={onClick} 
//         // onDblClick={onDblClick}
//         draggable={true} 
//         onDragStart={e => {
//             if (e.target) {
//                 e.dataTransfer?.setData("text", JSON.stringify(item));
//             }
//         }}>
//             <span class="icon icon-user img-circle media-object pull-left"></span>
//             <div class="media-body">
//                 <strong>{`${item.name}`}</strong><br></br>
//                 {`${item.type ? item.type : ""}`}
//             </div>
//         </li>
// };