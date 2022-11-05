// rename this file whatever u like
export class EDictionary<T_ID,T_OBJECT> {
    private list: T_OBJECT[];
    private map: Map<T_ID, number>;
    constructor() {
        this.list = [];
        this.map = new Map();
    }
    set(id: T_ID, entity: T_OBJECT) {
        if (this.has(id)) throw new Error(`The id ${id} already exists on the EDictionary`);
        const list_index = this.list.length;
        this.map.set(id, list_index);
        this.list.push(entity);
    }
    delete(id: T_ID) {
        const list_index = this.map.get(id);
        if (list_index == undefined) return false;
        if (list_index === this.list.length) {
            this.list.pop();
        } else {
            const entity = this.list[list_index];
            const temp = this.list[this.list.length - 1];
            this.list[this.list.length - 1] = entity;
            this.list[list_index] = temp;
            this.list.pop();
        }
        this.map.delete(id);
        return true;
    }
    get(id: T_ID) {
        const idx = this.map.get(id) as number;
        return this.list[idx];
    }
    has(id: T_ID) {
        return this.map.has(id);
    }
    clear() {
        this.list = [];
        this.map = new Map();
    }
    getList() {
        return this.list;
    }
    forEach(cb: Function) {
        for (let i = 0; i < this.list.length; i++) {
            cb(this.list[i], i, this.list);
        }
    }
}
