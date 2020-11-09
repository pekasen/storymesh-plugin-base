import { IStoreableObject } from './StoreableObject';
import { UIStore } from './UIStore';
import { ClassRegistry, ValueRegistry } from '../utils/registry';
import { IStoryObject } from 'storygraph/dist/StoryGraph/IStoryObject';
import { IPlugIn, PlugInClassRegistry } from '../utils/PlugInClassRegistry';
import { TextObject } from "../../plugins/TextObject";
import { action, makeObservable, observable, reaction } from 'mobx';

export interface IRootStoreProperties {
    // TODO: implement real data model
    uistate: UIStore
    
    storyContentObjectRegistry: ValueRegistry<IStoryObject>
    storyContentTemplatesRegistry: ClassRegistry<IStoryObject>
}

export class RootStore implements IStoreableObject<IRootStoreProperties> {
    uistate: UIStore
    storyContentObjectRegistry: ValueRegistry<IStoryObject & IPlugIn>
    storyContentTemplatesRegistry: PlugInClassRegistry<IStoryObject & IPlugIn>

    constructor(uistate?: UIStore) {
        this.uistate = uistate || new UIStore();

        // initialize all necessary registries
       
        // these ones are made observable
        this.storyContentObjectRegistry = new ValueRegistry<IStoryObject & IPlugIn>()
        // makeObservable(, {
        //     registerValue: action,
        //     deregisterValue: action,
        //     registry: observable,
        //     getRegisteredValue: false
        // });

        this.storyContentTemplatesRegistry = new PlugInClassRegistry<IStoryObject & IPlugIn>()
        // makeObservable( , {
        //     registry: observable,
        //     register: action,
        //     getNewInstance: false
        // });

        this.storyContentTemplatesRegistry.register([TextObject]);

        reaction(
            () => (this.storyContentObjectRegistry.registry.size),
            () => {
                console.log("Changed!")
        });
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
        this.uistate = new UIStore();
    }
}
