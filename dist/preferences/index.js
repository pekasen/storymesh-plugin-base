"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Preferences = void 0;
const fs_1 = require("fs");
const preact_1 = require("preact");
const serializr_1 = require("serializr");
const constants_1 = require("../constants");
const renderer_1 = require("electron/renderer");
class Preferences {
    constructor() {
        this.theme = "eggplant";
        this.author = "NGWebS Default User";
    }
}
exports.Preferences = Preferences;
Preferences.availableThemes = ["dark", "light", "eggplant"];
serializr_1.createModelSchema(Preferences, {
    theme: serializr_1.primitive(),
    author: serializr_1.primitive()
});
class PreferencesView extends preact_1.Component {
    constructor(_) {
        super();
        this.state = new Preferences();
        this.readPrefDict();
    }
    readPrefDict() {
        const data = fs_1.readFileSync(constants_1.__prefPath, { encoding: "UTF8" });
        const _d = JSON.parse(data);
        const _e = serializr_1.deserialize(Preferences, _d);
        if (_e)
            this.setState(_e);
    }
    writePrefDict() {
        const _d = serializr_1.serialize(Preferences, this.state);
        fs_1.writeFileSync(constants_1.__prefPath, JSON.stringify(_d), {
            encoding: "UTF8"
        });
        renderer_1.ipcRenderer.send('preferences', {});
    }
    render(_, { theme, author }) {
        console.log(this.state);
        const FormGroupitem = ({ children }) => (preact_1.h("div", { class: "form-group-item" }, children));
        const ThemePicker = ({ options }) => (preact_1.h(FormGroupitem, null,
            preact_1.h("label", null, "Theme"),
            preact_1.h("select", { class: "form-control", onInput: (ev) => {
                    const newValue = ev.target.value;
                    if (options.findIndex((v) => v === newValue) !== -1) {
                        console.log(newValue);
                        this.setState({ theme: newValue });
                    }
                } }, options.map(e => (preact_1.h("option", { selected: e === theme, value: e }, e))))));
        const AuthorField = () => (preact_1.h("div", { class: "form-group-item" },
            preact_1.h("label", null, "Author"),
            preact_1.h("input", { type: "text", value: author, onChange: (ev) => {
                    const value = ev.target.value;
                    this.setState({ author: value });
                } }, "NGWebS Default User")));
        return preact_1.h("div", { class: "window-contents preferences" },
            preact_1.h("h3", null, "Preferences"),
            preact_1.h("p", null, "NGWebS Core Prototype"),
            preact_1.h("p", null, "Version: 0.0.1a"),
            preact_1.h("form", null,
                preact_1.h(ThemePicker, { options: Preferences.availableThemes }),
                preact_1.h(AuthorField, null),
                preact_1.h("button", { class: "btn btn-default", onClick: () => window.close() }, "Cancel"),
                preact_1.h("button", { class: "btn btn-default", onClick: () => {
                        this.writePrefDict();
                        window.close();
                    } }, "OK")));
    }
}
const root = document.getElementById("preact-root");
if (root)
    preact_1.render(preact_1.h(PreferencesView, null), root);
//# sourceMappingURL=index.js.map