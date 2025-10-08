export class ExecutionCache<TInputs extends Array<unknown>, TOutput> {
  // Store cached results by key
  private cache: Map<string, TOutput> = new Map();
  
  // Store pending promises to prevent duplicate executions
  private pending: Map<string, Promise<TOutput>> = new Map();

  constructor(private readonly handler: (...args: TInputs) => Promise<TOutput>) {}
  
  async fire(key: string, ...args: TInputs): Promise<TOutput> {
    // Check if result is already cached
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }
    
    // Check if execution is already in progress
    if (this.pending.has(key)) {
      // Wait for the existing execution to complete
      return this.pending.get(key)!;
    }
    
    // Start new execution
    const promise = this.handler(...args)
      .then(result => {
        // Store result in cache
        this.cache.set(key, result);
        // Remove from pending
        this.pending.delete(key);
        return result;
      })
      .catch(error => {
        // If error occurs, remove from pending so it can be retried
        this.pending.delete(key);
        throw error;
      });
    
    // Store promise in pending map
    this.pending.set(key, promise);
    
    return promise;
  }
}
