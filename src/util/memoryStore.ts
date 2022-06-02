export class MemoryStore<T> {
    protected elements: Map<number, T>;
    private readonly defaultValue: T;

    constructor(defaultValue: T) {
        this.elements = new Map();
        this.defaultValue = defaultValue;
    }

    save(room: number, value: T) {
        this.elements.set(room, value);
    }

    find(room: number): T {
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

    remove(room: number, predicate: (value: T) => boolean) {
        if (this.elements.has(room)) {
            const filtered = this.elements.get(room)?.filter(predicate) as T[];
            this.save(room, filtered);
        }
    }

    append(room: number, value: T) {
        if (this.elements.has(room)) {
            this.elements.get(room)?.push(value);
        } else {
            this.save(room, [value]);
        }
    }
}
