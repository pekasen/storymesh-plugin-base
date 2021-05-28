import { action, makeObservable, observable } from 'mobx';
import { h, FunctionComponent } from "preact";
import { DataConnectorOutPort, StoryGraph } from 'storygraph';
import { INGWebSProps } from '../../renderer/utils/PlugInClassRegistry';
import { StoryObject } from '../helpers/AbstractStoryObject';
import { connectionField, nameField } from '../helpers/plugInHelpers';
import { exportClass } from '../helpers/exportClass';
import { createModelSchema, object } from 'serializr';
import { MenuTemplate, Text } from 'preact-sidebar';
import { rootEngine } from '../../renderer/components/App';
import { ConnectorSchema } from '../../renderer/store/schemas/ConnectorSchema';
import * as BABYLON from 'babylonjs';
import "babylonjs-loaders";
import { Engine } from 'babylonjs/Engines/engine';
import { NotificationCenter } from 'storygraph/dist/StoryGraph/NotificationCenter';
import { ContentSchema } from '../../renderer/store/schemas/ContentSchema';

export interface ISceneContent {
    file: string
    cached: boolean
    cache: BABYLON.Scene | undefined
}
class Scene extends StoryObject {
    
    public name = "Scene";
    public role = "internal.content.scene";
    public icon = "icon-box";
    public isContentNode = true;
    public userDefinedProperties: unknown;
    public dataOutCallback = () => {
        if (!this.content.cached) 
            this.getScene(rootEngine as unknown as Engine);
        return this.content
    }
    public dataOut = new DataConnectorOutPort("data-out",
        this.dataOutCallback
    );
    public content: ISceneContent = {
        file: "",
        cache: undefined,
        cached: false
    };

    constructor() {
        super();

        makeObservable(
            this, {
            name: observable,
            updateName: action,
            content: observable,
            updateContent: action
        });
    }

    public get menuTemplate(): MenuTemplate[] {
        const ret: MenuTemplate[] = [
            ...nameField(this),
            new Text("URL", {defaultValue: ""}, () => this.content.file, (arg: string) => this.updateContent(arg)),
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

    public getScene(engine: BABYLON.Engine) : void {
        const file = this.content.file;
        this.logger.info(`Loading ${file}`);
        this.content.cached = false;

        if (file) BABYLON.SceneLoader.LoadAsync(
            file,
            "",
            engine
        ).then((scene) => {
            this.logger.info("Loaded");
            this.content.cache = scene;
            this.content.cached = true;

            this.dataOut.connections.forEach(edge => {
                const [,portID] = StoryGraph.parseNodeId(edge.to);
                if (this.notificationCenter) this.notificationCenter.push(portID, {
                    data: undefined,
                    type: "data-notification",
                    source: this.dataOut
                });
            });
        });
    }

    public updateContent(file?: string) {
        const _file = file;
        this.logger.info("Trying to load", _file);

        if (
            file &&
            file.endsWith(".gltf")
        ) {
            this.content.file = file;
            if (rootEngine) this.getScene(rootEngine as unknown as Engine);
        } 
    }

    public get connectors() {
        const sup = super.connectors;
        sup.set(this.dataOut.id, this.dataOut);

        return sup;
    }

    public bindTo(notificationCenter: NotificationCenter) {
        super.bindTo(notificationCenter);
        this.dataOut.callback = this.dataOutCallback;
    }
}

createModelSchema(Scene, {
    dataOut: object(ConnectorSchema),
    content: object(ContentSchema)
})
export const plugInExport = exportClass(
    Scene,
    "Scene",
    "internal.content.scene",
    "icon-box",
    true
);
