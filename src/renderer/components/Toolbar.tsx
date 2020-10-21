import { Component, h } from 'preact';

export interface IListItem {
    name: string
    type?: string
}

interface IToolbarState {
    list: IListItem[]
}

export class Toolbar extends Component {

    private list: IListItem[];
    public state: IToolbarState;

    constructor() {
        super();

        this.list = [
            { name: "Philipp", type: "Lead" },
            { name: "Anca", type: "Backend" },
            { name: "Jannik", type: "Frontend" },
            { name: "Christian" } 
        ];
        this.state = {
            list: this.list
        };
    }

    render({}, state: IToolbarState) {
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
                {state.list.map(x => (
                    <li class="list-group-item" onClick={() => console.log("Hello!")} draggable={true} onDragStart={e => {
                        // dataTransfer.setData('text', ev.target.id);
                        if (e.target) {
                            e.dataTransfer?.setData("text", JSON.stringify(x));
                        }
                    }}>
                        <span class="icon icon-user img-circle media-object pull-left"></span>
                        <div class="media-body">
                            <strong>{`${x.name}`}</strong><br></br>
                            {`${x.type ? x.type : "NA"}`}
                        </div>
                    </li>
                ))}
        </ul>
    }

    shouldComponentUpdate(nextProps: {}, nextState: IToolbarState) {
        console.log(nextState);
        return !(this.state === nextState);
    }
}