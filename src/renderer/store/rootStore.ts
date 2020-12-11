import { createModelSchema, object, setDefaultModelSchema } from "serializr";
import { makeAutoObservable } from 'mobx';

import { AbstractStoryObject, StoryObject } from '../../plugins/helpers/AbstractStoryObject';
// import { makeSchemas } from './schemas/AbstractStoryObjectSchema';
import { AutoValueRegistrySchema, ClassRegistry, ValueRegistry, ValueRegistrySchema } from '../utils/registry';
import { IStoryObject } from 'storygraph/dist/StoryGraph/IStoryObject';
import { NotificationStore } from './Notification';
import { PlugInClassRegistry } from '../utils/PlugInClassRegistry';
import { plugInLoader } from './PlugInStore';
import { UIStore } from './UIStore';

export interface IRootStoreProperties {
    uistate: UIStore
    storyContentObjectRegistry: ValueRegistry<IStoryObject>
    storyContentTemplatesRegistry: ClassRegistry<IStoryObject>
}

export class RootStore {
    uistate: UIStore
    storyContentObjectRegistry: ValueRegistry<AbstractStoryObject>
    storyContentTemplatesRegistry: PlugInClassRegistry<AbstractStoryObject>
    notifications: NotificationStore;
    // topLevelObject: AbstractStoryObject;

    constructor(uistate?: UIStore) {
        /**
         * initialize the template store
         */
        this.uistate = uistate || new UIStore();

        /**
         * In this registry we store our instantiated StoryObjects
         */
        this.storyContentObjectRegistry = new ValueRegistry<AbstractStoryObject>()

        /**
         * In this registry we store our templates and plugin classes
         */
        this.storyContentTemplatesRegistry = new PlugInClassRegistry<AbstractStoryObject>()
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
                emptyStory.name = "My Story";
                // this.topLevelObject = emptyStory;
                this.storyContentObjectRegistry.register(
                    emptyStory
                );
                this.uistate.setLoadedItem(emptyStory.id);
                this.uistate.topLevelObjectID = emptyStory.id;
            }
        } else {
            // this.topLevelObject = new StoryObject()
        }
        /**
         * Initialize notification buffer
         */
        this.notifications = new NotificationStore();

        makeAutoObservable(this);
    }

    reset(): void {
        // this.model = new List();
        this.uistate = new UIStore();
    }

    replace(root: RootStore): void {
        this.storyContentObjectRegistry = root.storyContentObjectRegistry;
        this.uistate = root.uistate;
    }
}
// export const { AbstractStoryObjectSchema } = makeSchemas(rootStore.root.storyContentTemplatesRegistry);

/**
 * Initialize model schema
 */
export const RootStoreSchema = createModelSchema(
    RootStore,
    {
        uistate: object(UIStore),
        // topLevelObject: object(StoryObject)
        storyContentObjectRegistry: object(AutoValueRegistrySchema())
    }
);
