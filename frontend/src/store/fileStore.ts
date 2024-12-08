import { defineStore } from 'pinia';
import type { ProcessedBatch, ProcessedDocument } from '../types';
import { createStorageStrategy } from '../utils/storageFactory';
import type { StorageConfig, StorageStrategy } from '../types/storage';
import { getStorageConfig } from '../config/storage';

interface JobHistoryItem {
  id: string
  timestamp: string
  status: string
  totalFiles: number
  processedFiles: number
  cost: number
  totalTokens: number
  documents: {
    title: string
    id: string
  }[]
}

export const useFileStore = defineStore('file', {
  state: () => ({
    processedBatches: [] as ProcessedBatch[],
    currentBatch: null as ProcessedBatch | null,
    storageConfig: null as StorageConfig | null,
    storageStrategy: null as StorageStrategy | null,
    jobHistory: [] as JobHistoryItem[],
  }),

  actions: {
    async initialize() {
      this.storageConfig = await getStorageConfig();
      this.storageStrategy = createStorageStrategy(this.storageConfig);
      await Promise.all([
        this.loadBatches(),
        this.loadJobHistory()
      ]);
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
      if (this.storageConfig?.type === 'cloud' && 
          this.storageConfig?.environment === 'production') {
        // Future cloud sync implementation
        console.log('Cloud sync will be implemented');
      }
    },

    addJobToHistory(job: Omit<JobHistoryItem, 'id' | 'timestamp'>) {
      const newJob: JobHistoryItem = {
        ...job,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      };
      
      this.jobHistory.unshift(newJob);
      this.persistJobHistory();
    },

    async persistJobHistory() {
      try {
        await this.storageStrategy?.save(
          'notion-job-history',
          this.jobHistory
        );
      } catch (error) {
        console.error('Error saving job history:', error);
      }
    },

    async loadJobHistory() {
      try {
        const stored = await this.storageStrategy?.load('notion-job-history');
        if (stored) {
          this.jobHistory = stored;
        }
      } catch (error) {
        console.error('Error loading job history:', error);
      }
    },
  }
}); 