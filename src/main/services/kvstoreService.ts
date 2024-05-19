import KVStoreServiceImpl from "./impl/kvstoreServiceImpl";

export interface KVStoreService {
  init(): void

  set(key: string, value: string): void

  get(key: string): string
}

const kvstoreService = new KVStoreServiceImpl()
export default kvstoreService
