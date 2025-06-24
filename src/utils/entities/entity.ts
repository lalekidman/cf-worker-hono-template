import { IEntityBaseDependencies, IEntityBaseProperties } from "./interfaces";

export const makeBaseEntity = <ID = string>(
  {
    generateId
  }: IEntityBaseDependencies<ID>
) => (
  class BaseEntity implements IEntityBaseProperties<ID> {
    public id: ID;

    public createdAt: number = 0;
    public updatedAt: number = 0;

    public _v: number = 0;
    
    constructor (data?: Partial<IEntityBaseProperties<ID>>) {
      this.id = data?.id || generateId()
      this._v = data?._v || 0;
      this.createdAt = data?.createdAt || new Date().getTime();
      this.updatedAt = data?.updatedAt || 0;
    }

    /**
     * Update the entity
     */
    public update () {
      this.updatedAt = Date.now();
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