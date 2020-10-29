class Singleton {
    private static instance: Singleton

    public static getInstance(): Singleton {
        if(!Singleton.instance) {
            Singleton.instance = new this();
        }

        return Singleton.instance
    }

}

export class Registry extends Singleton {
    
}