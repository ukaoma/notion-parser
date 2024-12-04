import type { StorageStrategy, StorageConfig } from '../types/storage';

class LocalStorageStrategy implements StorageStrategy {
  async save(key: string, data: any): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('LocalStorage save error:', error);
      throw error;
    }
  }

  async load(key: string): Promise<any> {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  async delete(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    localStorage.clear();
  }

  getType(): string {
    return 'localStorage';
  }
}

class CloudStorageStrategy implements StorageStrategy {
  private config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = config;
  }

  async save(key: string, data: any): Promise<void> {
    // Placeholder for future cloud implementation
    console.log('Cloud storage save not implemented');
  }

  async load(key: string): Promise<any> {
    // Placeholder for future cloud implementation
    return null;
  }

  async delete(key: string): Promise<void> {
    // Placeholder for future cloud implementation
  }

  async clear(): Promise<void> {
    // Placeholder for future cloud implementation
  }

  getType(): string {
    return 'cloud';
  }
}

class MemoryStorageStrategy implements StorageStrategy {
  private storage: Map<string, any>;

  constructor() {
    this.storage = new Map();
  }

  async save(key: string, data: any): Promise<void> {
    this.storage.set(key, JSON.parse(JSON.stringify(data))); // Deep clone for isolation
  }

  async load(key: string): Promise<any> {
    const data = this.storage.get(key);
    return data ? JSON.parse(JSON.stringify(data)) : null;
  }

  async delete(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }

  getType(): string {
    return 'memory';
  }
}

export const createStorageStrategy = (config: StorageConfig): StorageStrategy => {
  switch (config.type) {
    case 'localStorage':
      return new LocalStorageStrategy();
    case 'cloud':
      return new CloudStorageStrategy(config);
    case 'memory':
      return new MemoryStorageStrategy();
    default:
      return config.environment === 'test' 
        ? new MemoryStorageStrategy() 
        : new LocalStorageStrategy();
  }
}; 