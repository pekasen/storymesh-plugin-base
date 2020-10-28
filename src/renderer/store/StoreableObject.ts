export interface IStoreableObject<T> {
    loadFromPersistance(from: T): void
}

export abstract class StoreableObject<T> implements IStoreableObject<T>  {
    abstract loadFromPersistance(from: T): void
}