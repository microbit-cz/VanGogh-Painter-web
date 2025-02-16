export class Store<T> {
    private data: { [key: string]: T[keyof T] | undefined } = {};
    private listeners: Partial<T>[] = [];

    private _update<K extends keyof T>(key: K, value: T[K] | undefined) {
        this.data[key as string] = value;

        this.listeners.forEach(listener => {
            if (listener[key] !== undefined) {
                listener[key] = value;
            }
        });
    }

    public addListener(listener: Partial<T>) {
        this.listeners.push(listener);
        Object.keys(this.data).forEach(key => {
            if (listener[key as keyof T] !== undefined) {
                listener[key as keyof T] = this.data[key];
            }
        });
    }

    public update<K extends keyof T>(key: K, value: T[K]) {
        this._update(key, value);
    }

    public get<K extends keyof T>(key: K): T[K] | undefined {
        return this.data[key as string] as T[K] | undefined;
    }

    public empty() {
        Object.keys(this.data).forEach(key => {
            this._update(key as keyof T, undefined);
        });
    }
}
