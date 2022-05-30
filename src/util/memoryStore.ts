export class MemoryStore<T> {
    protected elements: Map<string, T>;
    private defaultValue: T;

    constructor(defaultValue: T) {
        this.elements = new Map();
        this.defaultValue = defaultValue;
    }

    save(room: string, value: T) {
        this.elements.set(room, value);
    }

    find(room: string): T {
        if (this.elements.has(room)) {
            return this.elements.get(room) as T;
        }
        return this.defaultValue;
    }
}

export class ListMemoryStore<T> extends MemoryStore<T[]> {
    constructor() {
        super([]);
    }

    append(room: string, value: T) {
        if (this.elements.has(room)) {
            this.elements.get(room)?.push(value);
        } else {
            this.elements.set(room, [value]);
        }
    }
}
