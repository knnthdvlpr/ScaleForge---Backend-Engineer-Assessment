export class ObjectId {
  private data: Buffer;
  
  // Static variables shared across all instances (per process)
  private static randomValue: number = Math.floor(Math.random() * 0xFFFFFFFF); // 4 bytes random
  private static counter: number = Math.floor(Math.random() * 0xFFFFFF); // 3 bytes counter

  constructor(type: number, timestamp: number) {
    // Allocate a 14-byte buffer: 1 (type) + 6 (timestamp) + 4 (random) + 3 (counter)
    this.data = Buffer.alloc(14);
    
    // Write type (1 byte) at position 0
    this.data.writeUInt8(type, 0);
    
    // Write timestamp (6 bytes = 48 bits) at position 1
    // Use writeUIntBE for Big Endian (most significant byte first)
    this.data.writeUIntBE(timestamp, 1, 6);
    
    // Write random value (4 bytes) at position 7
    // This value is the same for all ObjectIds in the same process
    this.data.writeUInt32BE(ObjectId.randomValue, 7);
    
    // Write counter (3 bytes) at position 11
    // Increment the counter for each new ObjectId
    this.data.writeUIntBE(ObjectId.counter, 11, 3);
    
    // Increment counter for next ObjectId (wraps around at 0xFFFFFF)
    ObjectId.counter = (ObjectId.counter + 1) % 0x1000000;
  }

  static generate(type?: number): ObjectId {
    return new ObjectId(type ?? 0, Date.now());
  }
  
  toString(encoding?: 'hex' | 'base64'): string {
    return this.data.toString(encoding ?? 'hex');
  }
}