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
}

export const createStorageStrategy = (config: StorageConfig): StorageStrategy => {
  switch (config.type) {
    case 'localStorage':
      return new LocalStorageStrategy();
    case 'cloud':
      return new CloudStorageStrategy(config);
    default:
      return new LocalStorageStrategy();
  }
}; 