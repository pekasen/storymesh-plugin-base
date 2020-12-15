import { createModelSchema, deserialize, object, serialize } from "serializr";
import { makeAutoObservable } from 'mobx';

import { AbstractStoryObject } from '../../plugins/helpers/AbstractStoryObject';
import { AutoValueRegistrySchema, ClassRegistry, ValueRegistry } from '../utils/registry';
import { IStoryObject } from 'storygraph/dist/StoryGraph/IStoryObject';
import { NotificationStore } from './Notification';
import { PlugInClassRegistry } from '../utils/PlugInClassRegistry';
import { plugInLoader } from './PlugInStore';
import { UIStore } from './UIStore';
import { rootStore } from "..";
import { Preferences } from "../../preferences";
import { readFileSync } from "original-fs";
import { __prefPath } from "../../constants";
import { ipcRenderer } from "electron";
import { Container } from "../../plugins/Container";

export interface IRootStoreProperties {
    uistate: UIStore
    storyContentObjectRegistry: ValueRegistry<IStoryObject>
    storyContentTemplatesRegistry: ClassRegistry<IStoryObject>
}

type Partial<T> = {
    [P in keyof T]?: T[P];
};

export interface IState {
    uistate: Partial<UIStore>
    storyContentObjectRegistry: Partial<ClassRegistry<IStoryObject>>;
}

export class Procotol {
    buffer: IState[] = [];

    public burry(): void {
        const zombie = serialize(RootStoreSchema, rootStore.root) as IState;
        this.buffer.push(zombie);
    }

    public revive(): void {
        const zombie = this.buffer.pop()
        if (zombie) deserialize(RootStoreSchema, zombie, (err, res) => {
            rootStore.root.replace(res);
        });
    }
}

export class RootStore {
    uistate: UIStore
    storyContentObjectRegistry: ValueRegistry<AbstractStoryObject>
    storyContentTemplatesRegistry: PlugInClassRegistry<AbstractStoryObject>
    notifications: NotificationStore;
    protocol: IState[];
    userPreferences: Preferences;
    // topLevelObject: AbstractStoryObject;

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
        this.storyContentTemplatesRegistry = new PlugInClassRegistry<AbstractStoryObject>();
        /**
         * Read the plugins and register them in the template store
         */
        const plugins = plugInLoader();
        this.storyContentTemplatesRegistry.register(plugins);
        /**
         * If we are in a empty and untitled document, make a root storyobject
         */
        if (this.uistate.untitledDocument) {
            const emptyStory = this.storyContentTemplatesRegistry.getNewInstance("internal.container.container");
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
        this.protocol = [];

        makeAutoObservable(this, {
            protocol: false
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
        const data = readFileSync(
            __prefPath,
            {encoding: "UTF8"}
        );
        const _d = JSON.parse(data);
        const _e  = deserialize(Preferences, _d);

        if (_e) this.userPreferences = _e;
    }
}

/**
 * Initialize model schema
 */
export const RootStoreSchema = createModelSchema(
    RootStore,
    {
        uistate: object(UIStore),
        // topLevelObject: object(StoryObject)
        storyContentObjectRegistry: object(AutoValueRegistrySchema()),
        // protocol: list(object())
    }
);
