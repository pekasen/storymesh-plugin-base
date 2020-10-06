import { Component, h } from 'preact';

export class Toolbar extends Component {
    render({}, {}) {
        return <ul>
            <li onClick={() => console.log("Hello!")}>Home</li>
            <li>Networks</li>
        </ul>
    }
}