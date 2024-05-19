import {KVStoreService} from "../kvstoreService";
import Store from 'electron-store';



export default class KVStoreServiceImpl implements KVStoreService {

  store = new Store()

  init(): void {
    throw new Error('Method not implemented.');
  }

  set(key: string, value: string): void {
    this.store.set(key, value)
  }

  get(key: string): string {
    return this.store.get(key) as string
  }

}
