export interface StorageStrategy {
  save: (key: string, data: any) => Promise<void>;
  load: (key: string) => Promise<any>;
  delete: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

export interface CloudStorageConfig {
  endpoint: string;
  apiKey?: string;
  region?: string;
  bucket?: string;
}

export interface StorageConfig {
  type: 'localStorage' | 'indexedDB' | 'cloud';
  cloudConfig?: CloudStorageConfig;
  persistenceKey?: string;
  maxBatchSize?: number;
  compression?: boolean;
} 