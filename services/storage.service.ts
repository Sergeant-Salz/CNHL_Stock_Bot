import {LocalStorage, InitOptions} from "node-persist";


/**
 * This Class is useless but if we ever change the DB this abstraction should make it easy
 */
export class StorageService {
    private storage: LocalStorage = require('node-persist');

    constructor() {
    }

    public async init(): Promise<StorageService> {
        const defaultStorageOptions: InitOptions = {
            dir: '/persist/'
        }
        await this.storage.init(defaultStorageOptions);
        return this;
    }

    public async getValue(key: string): Promise<any> {
        return this.storage.getItem(key);
    }

    public async setValue(key: string, value: any): Promise<void> {
        await this.storage.setItem(key, value);
    }
}
