import type { StorageConfig } from '../types/storage';

const defaultConfig: StorageConfig = {
  type: 'localStorage',
  persistenceKey: 'notion-processed-batches',
  maxBatchSize: 1000,
  compression: false
};

export const getStorageConfig = async (): Promise<StorageConfig> => {
  const env = import.meta.env;
  
  if (env.VITE_STORAGE_TYPE) {
    return {
      type: env.VITE_STORAGE_TYPE as StorageConfig['type'],
      cloudConfig: env.VITE_STORAGE_TYPE === 'cloud' ? {
        endpoint: env.VITE_CLOUD_ENDPOINT,
        apiKey: env.VITE_CLOUD_API_KEY,
        region: env.VITE_CLOUD_REGION,
        bucket: env.VITE_CLOUD_BUCKET
      } : undefined,
      persistenceKey: env.VITE_PERSISTENCE_KEY || defaultConfig.persistenceKey,
      maxBatchSize: Number(env.VITE_MAX_BATCH_SIZE) || defaultConfig.maxBatchSize,
      compression: env.VITE_STORAGE_COMPRESSION === 'true'
    };
  }
  
  return defaultConfig;
};

export const initializeStorage = async () => {
  const config = await getStorageConfig();
  
  if (config.type === 'indexedDB') {
    // Initialize IndexedDB
    // Implementation to be added when needed
  }
  
  return config;
}; 