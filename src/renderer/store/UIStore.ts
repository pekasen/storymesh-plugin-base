import { makeAutoObservable } from "mobx";
import { MoveableItem } from "./MoveableItem";
import { IStoreableObject } from './StoreableObject';
import { WindowProperties } from './WindowProperties';
import { ValueRegistry } from '../utils/registry';
import { IStoryObject } from 'storygraph/dist/StoryGraph/IStoryObject';
import { RootStore } from './rootStore';
import { EdgeItem } from "./EdgeItem";

interface IUIStoreProperties {
    windowProperties: WindowProperties
    moveableItems: ValueRegistry<MoveableItem<IStoryObject>>
    term: string
    file: string
}

export class UIStore implements IStoreableObject<IUIStoreProperties> {
    windowProperties: WindowProperties
    moveableItems: ValueRegistry<MoveableItem<IStoryObject>>
    edges: EdgeItem[]
    term: string
    file: string
    leftSidebar: boolean
    selectedItem: string
    loadedItem: string
    private _parent: RootStore

    constructor(parent: RootStore) {
        this._parent = parent;
        this.loadedItem = "";
        this.selectedItem = "";
        this.edges = [];

        // TODO: make stuff move again!!1
        this.moveableItems = new ValueRegistry<MoveableItem<IStoryObject>>();
        this.file = "";
        // TODO: actually use the WindowProperties!
        this.windowProperties = new WindowProperties();
        
        this.term = "";
        this.leftSidebar = false;
        
        makeAutoObservable(this);
    }

        
    appendEdgeItem(edge: EdgeItem): void {
        this.edges = [...this.edges, edge];
    }

    removeEdgeItem(edge: EdgeItem): void {
        const index = this.edges.indexOf(edge);
        if (index !== -1) {
            this.edges.splice(index, 1);
        }
    }

    setLoadedItem(id: string): void {
        const obj = this._parent.storyContentObjectRegistry.getValue(id);
        if (obj) {
            this.loadedItem = obj.id;
        }
    }

    setFile(file: string): void {
        this.file = file;
    }

  
    loadFromPersistance(from: IUIStoreProperties): void {
        this.file = from.file;
        this.term = from.term;
        this.windowProperties.loadFromPersistance(from.windowProperties);
        // this.moveableItems = from.moveableItems
        // .map(e => {
        //     const data = rootStore.model.itemByID(e.data.id);
        //     if (data !== undefined) return new MoveableItem(data, e.x, e.y)
        // })
        // .filter(e => e !== undefined) as MoveableItem[];
    }

    // TODO: implement
    writeToPersistance(): void {
        null
    }

    toggleSidebar(): void {
        this.leftSidebar = !this.leftSidebar;
    }

    setselectedItem(id: string): void {
        this.selectedItem = id;
    }

    get untitledDocument (): boolean {
        return this.file === "";
    }
}
