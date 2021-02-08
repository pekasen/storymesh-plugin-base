import { action, makeObservable, observable } from 'mobx';
import { h, FunctionComponent } from "preact";
import { DataConnectorInPort, DataConnectorOutPort, FlowConnectorInPort, FlowConnectorOutPort, IConnectorPort, StoryGraph } from 'storygraph';
import { IMenuTemplate, INGWebSProps } from '../../renderer/utils/PlugInClassRegistry';
import { StoryObject } from '../helpers/AbstractStoryObject';
import { connectionField, nameField } from '../helpers/plugInHelpers';
import { exportClass } from '../helpers/exportClass';
import { createModelSchema } from 'serializr';

export interface ISceneContent {
    file: string
}

class _Scene extends StoryObject {
    public content: ISceneContent;
    public childNetwork?: StoryGraph | undefined;
    public name: string;
    public role: string;
    public isContentNode = true;
    public userDefinedProperties: unknown;
    public icon: string;

    constructor() {
        super();

        this.name = "Scene";
        this.role = "internal.content.scene";
        this.icon = "icon-box";
        this.content = {
            file: ""
        };
        this.makeDefaultConnectors();
        const dataOut = new DataConnectorOutPort("data-out", () => (this.content));
        this._connectors.set(dataOut.id, dataOut);

        makeObservable(
            this, {
            name: observable,
            updateName: action,
            content: observable,
            updateContent: action
        });
    }

    public get menuTemplate(): IMenuTemplate[] {
        const ret: IMenuTemplate[] = [
            ...nameField(this),
            {
                label: "Scene Location",
                type: "file-selector",
                value: () => this.content.file,
                valueReference: (file: string) => this.updateContent(file)
            },
            ...connectionField(this)
        ];
        if (super.menuTemplate) ret.push(...super.menuTemplate);
        return ret;
    }
    
    public updateName(name: string): void {
        this.name = name;
    }

    public getComponent() {
        return () => null;
    }

    public getEditorComponent(): FunctionComponent<INGWebSProps> {
        return () => <div class="editor-component"></div>
    }

    public getScene(engine: BABYLON.Engine) : Promise<BABYLON.Scene> | undefined {
 
        const file = this.content.file;
        if (file) return BABYLON.SceneLoader.LoadAsync(
            file,
            "",
            engine
        );

    }

        // const scene = new BABYLON.Scene(
        //     new BABYLON.Engine(
        //         canvas,
        //         true,
        //         undefined,
        //         true
        //     ));

    public updateContent(file?: string) {
        if (file) this.content.file = file;
    }
}
createModelSchema(_Scene, {})
export const plugInExport = exportClass(
    _Scene,
    "Scene",
    "internal.content.scene",
    "icon-box",
    true
);
