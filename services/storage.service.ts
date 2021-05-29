import {InitOptions, LocalStorage} from 'node-persist';

/**
 * This Class is useless but if we ever change the DB this abstraction should make it easy
 */
export class StorageService {
    private storage: LocalStorage;

    constructor() {
        const defaultStorageOptions: InitOptions = {
            dir: '/persist/'
        }
        this.storage = new LocalStorage(defaultStorageOptions);
    }

    public async getValue(key: string): Promise<any> {
        return this.storage.getItem(key);
    }

    public async setValue(key: string, value: any): Promise<void> {
        await this.storage.setItem(key, value);
    }
}
