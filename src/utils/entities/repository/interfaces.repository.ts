export interface IBaseRepository<T> {
  // Query methods
  findById(id: string): Promise<T | null>;
  exists(userId: string): Promise<boolean>;
    
  save(settings: T): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}