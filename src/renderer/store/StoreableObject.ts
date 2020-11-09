export interface IStoreableObject<T> {
    loadFromPersistance(from: T): void
    writeToPersistance(from: T): void
}

export abstract class StoreableObject<T> implements IStoreableObject<T>  {
    abstract loadFromPersistance(from: T): void
    abstract writeToPersistance(): void
}