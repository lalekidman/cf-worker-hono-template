import { AdditionalConditions } from "../pagination";

export interface IBaseRepositoryService<T> {
  // Query methods
  findById(id: string): Promise<T | null>;
  findOne(entity: Partial<T>): Promise<T | null>;
  find(conditions?: AdditionalConditions<T>[]): Promise<T[]>;

  insert(dataInput: Omit<T, 'id' | 'createdAt' | 'updatedAt' | '_v'>): Promise<boolean>;
  update(id: string, data: Partial<T>): Promise<boolean>;
  deleteById(id: string): Promise<boolean>;
  delete(entity: Partial<T>): Promise<boolean>;

}
