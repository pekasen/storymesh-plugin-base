import { readFileSync, writeFileSync } from "fs";
import { Component, FunctionalComponent, h, JSX, render } from "preact";
import { createModelSchema, deserialize, primitive, serialize } from "serializr";
import { __prefPath } from "../constants";
import { remote } from "electron";
import { ipcRenderer } from "electron/renderer";
// const { windows } = remote;

type Themes = "dark" | "light" | "eggplant";

export class Preferences {
    theme:  Themes = "eggplant";
    author = "NGWebS Default User";
    static availableThemes = ["dark", "light", "eggplant"];
}

createModelSchema(Preferences, {
    theme: primitive(),
    author: primitive()
})

interface IThemePickerProps {
    options: string[]
}

class PreferencesView extends Component<unknown, Preferences> {

    constructor(_: never) {
        super();
        this.state = new Preferences();
        this.readPrefDict();
    }


    public readPrefDict() {
        const data = readFileSync(
            __prefPath,
            {encoding: "UTF8"}
        );
        const _d = JSON.parse(data);
        const _e  = deserialize(Preferences, _d);
        if (_e) this.setState(_e);
    }

    public writePrefDict() {
        const _d = serialize(Preferences, this.state);
        writeFileSync(
            __prefPath,
            JSON.stringify(_d), {
                encoding: "UTF8"
            }
        );

        ipcRenderer.send('preferences', {});
    }

    public render(_: never, {theme, author}: Preferences): JSX.Element {

        console.log(this.state);
        
        const FormGroupitem: FunctionalComponent = ({children}) => (
            <div class="form-group-item">{children}</div>
        );
        
        const ThemePicker: FunctionalComponent<IThemePickerProps> = ({ options }) => (
            <FormGroupitem>
                <label>Theme</label>
                <select class="form-control" onInput={(ev: Event) => {
                    const newValue = (ev.target as HTMLSelectElement).value;
                    if (options.findIndex((v) => v === newValue) !== -1) {
                        console.log(newValue);
                        this.setState({ theme: newValue as Themes});
                    }
                }}>
                    {
                        options.map(e => (
                            <option selected={e === theme} value={e}>{e}</option>
                        ))
                    }
                </select>
            </FormGroupitem>
        );
        
        const AuthorField: FunctionalComponent = () => (
            <div class="form-group-item">
                <label>Author</label>
                <input type="text" value={author} onChange={(ev: Event) => {
                    const value = (ev.target as HTMLInputElement).value;
                    this.setState({author: value});
                }}>
                    NGWebS Default User
                </input>
            </div>
        );
        
        return <div class="window-contents preferences">
            <h3>Preferences</h3>
            <p>NGWebS Core Prototype</p>
            <p>Version: 0.0.1a</p>
            <form>
                <ThemePicker options={Preferences.availableThemes} />
                <AuthorField />
                <button class="btn btn-default" onClick={() => window.close()}>Cancel</button>
                <button class="btn btn-default" onClick={() => {
                    this.writePrefDict();
                    window.close();
                }}>OK</button>
            </form>
        </div>
    }
}

const root = document.getElementById("preact-root");
if (root) render(<PreferencesView />, root);
