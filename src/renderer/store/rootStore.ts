import { IStoreableObject } from './StoreableObject';
import { UIStore } from './UIStore';
import { ClassRegistry, ValueRegistry } from '../utils/registry';
import { IStoryObject } from 'storygraph/dist/StoryGraph/IStoryObject';
import { IPlugIn, PlugInClassRegistry } from '../utils/PlugInClassRegistry';
import { plugInLoader } from './PlugInStore';

export interface IRootStoreProperties {
    uistate: UIStore
    storyContentObjectRegistry: ValueRegistry<IStoryObject>
    storyContentTemplatesRegistry: ClassRegistry<IStoryObject>
}

export class RootStore implements IStoreableObject<IRootStoreProperties> {
    uistate: UIStore
    storyContentObjectRegistry: ValueRegistry<IStoryObject & IPlugIn>
    storyContentTemplatesRegistry: PlugInClassRegistry<IStoryObject & IPlugIn>

    constructor(uistate?: UIStore) {
        /**
         * initialize the template store
         */
        this.uistate = uistate || new UIStore(this);

        /**
         * In this registry we store our instantiated StoryObjects
         */
        this.storyContentObjectRegistry = new ValueRegistry<IStoryObject & IPlugIn>()

        /**
         * In this registry we store our templates and plugin classes
         */
        this.storyContentTemplatesRegistry = new PlugInClassRegistry<IStoryObject & IPlugIn>()
        /**
         * Read the plugins and register them in the template store
         */
        this.storyContentTemplatesRegistry.register(
            plugInLoader()
        );

        /**
         * If we are in a empty and untitled document, make a root storyobject
         */
        if (this.uistate.untitledDocument) {
            const emptyStory = this.storyContentTemplatesRegistry.getNewInstance("internal.container.container");
            if (emptyStory) {
                emptyStory.name = "MyStory";
                this.storyContentObjectRegistry.register(
                    emptyStory
                );
                this.uistate.setLoadedItem(emptyStory.id);
                this.uistate.topLevelObjectID = emptyStory.id;
            }
        }
    }

    loadFromPersistance(from: IRootStoreProperties): void {
        // this.model.loadFromPersistance(from.model);
        this.uistate.loadFromPersistance(from.uistate);
    }

    writeToPersistance(): void {
        null
    }

    reset(): void {
        // this.model = new List();
        this.uistate = new UIStore(this);
    }
}
