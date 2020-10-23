import { autorun } from 'mobx';
import { Component, h } from 'preact';
import { List, ListItem } from '..';

export interface IListItem {
    name: string
    type?: string
}

interface IToolbarState {
    list: IListItem[]
}

interface IToolbarProps {
    list: List
}

export class Toolbar extends Component<IToolbarProps, IToolbarState> {

    private list: IListItem[];
    public state: IToolbarState;

    constructor(props?: any) {
        if (props) {
            super(props);
        } else {
            super();
        }

        this.list = [
            { name: "Philipp", type: "Lead" },
            { name: "Anca", type: "Backend" },
            { name: "Jannik", type: "Frontend" },
            { name: "Christian" } 
        ];
        this.state = {
            list: this.props.list.members
        };
 
        autorun(() => {
            console.log("update ", props.list.members);
            this.props.list.members.map(e => {
                autorun(() => {
                    console.log("update " + e.name, e)
                    this.forceUpdate();
                });
            })
            this.forceUpdate();
        });
    }

    render({ list }: IToolbarProps, state: IToolbarState) {
        return <ul class="list-group">
                <li class="list-group-header">
                <input
                        class="form-control"
                        type="text"
                        placeholder="Search for someone"
                        onChange={e =>{
                            this.setState({
                                list: (this.list.filter(i => {
                                    let term = e.currentTarget.value;
                                    if (term !== "") {
                                        return i.name.match(term) ||
                                        i.type?.match(term)

                                    } else {
                                        return this.list
                                    }
                                }))
                            })
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
                {list.members.map(x => (
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
