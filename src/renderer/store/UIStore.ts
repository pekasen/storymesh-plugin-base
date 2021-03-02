import { makeAutoObservable } from "mobx";
import { MoveableItem, MoveableItemSchema } from "./MoveableItem";
import { WindowProperties } from './WindowProperties';
import { ValueRegistry, ValueRegistrySchema } from '../utils/registry';
import { SelectedItemStore, SelectedItemStoreSchema } from './SelectedItemStore';
import { createModelSchema, list, object, primitive, setDefaultModelSchema } from 'serializr';
import Logger from "js-logger";


export class UIStore {
    windowProperties: WindowProperties
    moveableItems: ValueRegistry<MoveableItem>
    file: string
    selectedItems: SelectedItemStore
    loadedItem: string
    topLevelObjectID: string

    constructor() {
        this.loadedItem = "";
        this.selectedItems = new SelectedItemStore();
        this.topLevelObjectID = "";
        this.moveableItems = new ValueRegistry<MoveableItem>();
        this.file = "";
        this.windowProperties = new WindowProperties();
        makeAutoObservable(this);
    }

    setLoadedItem(id: string): void {
        this.loadedItem = id;
    }

    setFile(file: string): void {
        this.file = file;
        const titleRG = /\w+(?=\.(json))/gm;
        const title = titleRG.exec(file);
        Logger.info("Saved as", title);
        if(title && title[0]) {
            this.windowProperties.setTitle(
                String(title[0])
            );
        }
    }

    replace({ windowProperties, moveableItems, file, selectedItems, loadedItem, topLevelObjectID }: UIStore) : void {
        this.windowProperties = windowProperties;
        this.moveableItems = moveableItems;
        this.file = file;
        this.selectedItems = selectedItems;
        this.loadedItem = loadedItem;
        this.topLevelObjectID = topLevelObjectID;
    }

    get untitledDocument (): boolean {
        return this.file === "";
    }
}

const UIStoreSchema = createModelSchema(UIStore, {
    windowProperties: object(WindowProperties),
    selectedItems: object(SelectedItemStoreSchema),
    file: primitive(),
    loadedItem: primitive(),
    topLevelObjectID: primitive(),
    moveableItems: object(ValueRegistrySchema(MoveableItemSchema))
});

setDefaultModelSchema(UIStore, UIStoreSchema);
