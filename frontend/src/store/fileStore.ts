import { defineStore } from 'pinia';
import type { ProcessedBatch, ProcessedDocument } from '../types';
import { createStorageStrategy } from '../utils/storageFactory';
import type { StorageConfig } from '../types/storage';
import { getStorageConfig } from '../config/storage';

export const useFileStore = defineStore('file', {
  state: () => ({
    processedBatches: [] as ProcessedBatch[],
    currentBatch: null as ProcessedBatch | null,
    storageConfig: null as StorageConfig | null,
    storageStrategy: null as any,
  }),

  actions: {
    async initialize() {
      this.storageConfig = await getStorageConfig();
      this.storageStrategy = createStorageStrategy(this.storageConfig);
      await this.loadBatches();
    },

    async saveBatch(batch: Omit<ProcessedBatch, 'id' | 'timestamp'>) {
      const newBatch: ProcessedBatch = {
        ...batch,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        stats: {
          ...batch.stats,
          avgTokensPerDoc: Math.round(batch.totalTokens / batch.documentCount),
        }
      };
      
      this.processedBatches.unshift(newBatch);
      this.currentBatch = newBatch;
      
      await this.persistBatches();
    },

    async loadBatches() {
      try {
        const stored = await this.storageStrategy?.load('notion-processed-batches');
        if (stored) {
          this.processedBatches = stored;
        }
      } catch (error) {
        console.error('Error loading batches:', error);
      }
    },

    async persistBatches() {
      try {
        await this.storageStrategy?.save(
          'notion-processed-batches',
          this.processedBatches
        );
      } catch (error) {
        console.error('Error saving batches:', error);
      }
    },

    async deleteBatch(id: string) {
      this.processedBatches = this.processedBatches.filter(
        batch => batch.id !== id
      );
      await this.persistBatches();
    },

    async syncWithCloud() {
      if (this.storageConfig?.type === 'cloud') {
        // Future cloud sync implementation
        console.log('Cloud sync will be implemented');
      }
    }
  }
}); 