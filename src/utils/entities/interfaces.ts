export interface IEntityBaseDependencies<T = string> {
  generateId: (id?: string) => T
}

export interface IEntityBaseProperties<ID = string> {
  id: ID
  
  createdAt: number
  updatedAt: number
  
  _v: number
}
