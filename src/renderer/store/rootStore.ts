import { ipcRenderer } from "electron";
import { makeAutoObservable } from 'mobx';
import { deepObserve } from "mobx-utils";
import { existsSync, readFileSync } from "original-fs";
import { createModelSchema, deserialize, object } from "serializr";
import { IStoryObject } from 'storygraph/dist/StoryGraph/IStoryObject';
import { __prefPath } from "../../constants";
import { Container } from "../../plugins/content/Container";
import { AbstractStoryObject } from '../../plugins/helpers/AbstractStoryObject';
import { AbstractStoryModifier } from "../../plugins/helpers/AbstractModifier";
import { Preferences } from "../../preferences";
import { AutoValueRegistrySchema, ClassRegistry, ValueRegistry } from '../utils/registry';
import { NotificationStore } from './Notification';
import { plugInLoader2, PlugInStore } from './PlugInStore';
import { StateProcotol } from "./StateProcotol";
import { UIStore } from './UIStore';
import { IPlugInRegistryEntry } from "../utils/PlugInClassRegistry";

export interface IRootStoreProperties {
    uistate: UIStore
    storyContentObjectRegistry: ValueRegistry<IStoryObject>
    storyContentTemplatesRegistry: ClassRegistry<IStoryObject>
}

export class RootStore {
    uistate: UIStore
    storyContentObjectRegistry: ValueRegistry<AbstractStoryObject>
    pluginStore: PlugInStore<AbstractStoryObject | AbstractStoryModifier>;
    notifications: NotificationStore;
    protocol: StateProcotol;
    userPreferences: Preferences;

    constructor(uistate?: UIStore) {
        /**
         * load'dem user perferencenses
         */
        this.userPreferences = new Preferences();
        this.readPreferences();
        ipcRenderer.on('reload-preferences', () => {
            this.readPreferences();
        });
        /**
         * initialize the template store
         */
        this.uistate = uistate || new UIStore();
        /**
         * In this registry we store our instantiated StoryObjects
         */
        this.storyContentObjectRegistry = new ValueRegistry<AbstractStoryObject>();
        /**
         * In this registry we store our templates and plugin classes
         */
        this.pluginStore = new PlugInStore();
        /**
         * Read the plugins and register them in the template store
         */
        const plugins = plugInLoader2("plugins/content");
        const modifiers = plugInLoader2("plugins/modifiers");

        plugins.forEach((plug: IPlugInRegistryEntry<AbstractStoryObject>) => this.pluginStore.setPlugIn(plug.id, plug));
        modifiers.forEach(plug => this.pluginStore.setPlugIn(plug.id, plug));
    
        /**
         * If we are in a empty and untitled document, make a root storyobject
         */
        if (this.uistate.untitledDocument) {
            const emptyStory = this.pluginStore.getNewInstance("internal.content.container") as AbstractStoryObject;
            if (emptyStory) {
                this.storyContentObjectRegistry.register(
                    emptyStory
                );
                (emptyStory as Container).setup(this.storyContentObjectRegistry, this.uistate);
                emptyStory.name = "My Story";
                // this.topLevelObject = emptyStory;
                this.uistate.setLoadedItem(emptyStory.id);
                this.uistate.topLevelObjectID = emptyStory.id;
            }
        }
        /**
         * Initialize notification buffer
         */
        this.notifications = new NotificationStore();
        /**
         * Initialize protocol buffer
         */
        this.protocol = new StateProcotol();

        makeAutoObservable(this, {
            protocol: false
        });

        deepObserve(this, (change): void => {
            // console.log("changed state", path);
            this.protocol.persist(change);
        });
    }

    reset(): void {
        this.uistate = new UIStore();
    }

    replace(root: RootStore): void {
        this.storyContentObjectRegistry = root.storyContentObjectRegistry;
        this.uistate = root.uistate;
    }

    readPreferences(): void {
        if (existsSync(__prefPath)) {
            const data = readFileSync(
                __prefPath,
                {
                    encoding: "utf8"
                }
            );
            const _d = JSON.parse(data);
            const _e  = deserialize(Preferences, _d);
    
            if (_e) this.userPreferences = _e;
        }
    }
}

/**
 * Initialize model schema
 */
export const RootStoreSchema = createModelSchema(
    RootStore,
    {
        uistate: object(UIStore),
        storyContentObjectRegistry: object(AutoValueRegistrySchema()),
    }
);

// observe(this, (change) => console.log("changed state", change));
        // spy((change) => {
        //     // console.log("changed state", change)
        //     if (change.type == "add" ||
        //         change.type == "splice" ||
        //         change.type == "update" ||
        //         change.type == "remove") {
        //             this.protocol.persist(change);
        //         }
        // });
        // reaction(
        //     () => {
                

        //         // eslint-disable-next-line @typescript-eslint/ban-types
        //         const traverse = (o: object) => {
        //             const _ret: unknown[] = [];
        //             Object.entries(o).forEach(value => {
        //                 const [key, val] = value;
        //                 console.log(key);

        //                 if (val && typeof val === "object") {
        //                     _ret.push(...traverse(val));
        //                 } else if (val) {
        //                     _ret.push(val)
        //                 }
        //             })
        //             return _ret;
        //         }
                
        //         const _r = traverse(this.storyContentObjectRegistry);
        //         console.log(_r);

        //     },
        //     (arg, prev, r) => {
        //         console.log("state", r);
        //     }
        // )