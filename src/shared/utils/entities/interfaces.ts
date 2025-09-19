export interface IEntityBaseDependencies<T = string> {
  generateId: (id?: string) => T
}

export interface IEntityBaseProperties<ID = string> {
  id: ID
  
  createdAt: Date
  updatedAt: Date
  
  _v: number
}
export type IEntityMethodBaseProperties<T> = T & {
  update(): void
  toObject(): T
}
