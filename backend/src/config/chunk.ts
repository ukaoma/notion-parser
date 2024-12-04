export const chunkConfig = {
  defaultSize: 50,  // Maintain original default
  optimizedSize: 25,
  minSize: 10,
  maxSize: 50,
  getChunkSize: (totalDocs: number) => {
    // Preserve original behavior by default
    if (!process.env.USE_OPTIMIZED_CHUNKS) {
      return chunkConfig.defaultSize;
    }
    return totalDocs > 100 ? chunkConfig.optimizedSize : chunkConfig.defaultSize;
  }
}; 