import { IEntityBaseDependencies, IEntityBaseProperties } from "./interfaces";

export const makeBaseEntity = <ID = string>(
  {
    generateId
  }: IEntityBaseDependencies<ID>
) => (
  class BaseEntity implements IEntityBaseProperties<ID> {
    public id: ID;

    public createdAt: Date;
    public updatedAt: Date;

    public _v: number = 0;
    
    constructor (data?: Partial<IEntityBaseProperties<ID>>) {
      this.id = data?.id || generateId()
      this._v = data?._v || 0;
      this.createdAt = data?.createdAt || new Date()
      this.updatedAt = data?.updatedAt || new Date(0);
    }

    /**
     * Update the entity
     */
    public update () {
      this.updatedAt = new Date()
      this._v++;
    }
  
    public toObject (): IEntityBaseProperties<ID> {
      return {
        id: this.id,
        _v: this._v,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      }
    }
  }
)