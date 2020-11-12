import { makeAutoObservable } from "mobx";
import { MoveableItem } from "./MoveableItem";
import { IStoreableObject } from './StoreableObject';
import { WindowProperties } from './WindowProperties';
import { ValueRegistry } from '../utils/registry';
import { RootStore } from './rootStore';

interface IUIStoreProperties {
    windowProperties: WindowProperties
    moveableItems: ValueRegistry<MoveableItem>
    term: string
    file: string
}

export class UIStore implements IStoreableObject<IUIStoreProperties> {
    windowProperties: WindowProperties
    moveableItems: ValueRegistry<MoveableItem>
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

        // TODO: make stuff move again!!1
        this.moveableItems = new ValueRegistry<MoveableItem>();
        this.file = "";
        // TODO: actually use the WindowProperties!
        this.windowProperties = new WindowProperties();
        
        this.term = "";
        this.leftSidebar = false;
        
        makeAutoObservable(this);
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
