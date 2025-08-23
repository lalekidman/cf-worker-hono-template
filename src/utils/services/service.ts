import { IEntityBaseProperties, IEntityMethodBaseProperties } from "../entities";
import { IBaseRepositoryService } from "../repository/interfaces.repository";

export abstract class BaseService<T extends IEntityBaseProperties, Entity extends IEntityMethodBaseProperties<T>> {
  protected abstract readonly repositoryService: IBaseRepositoryService<T>
  constructor (
    private readonly entity: new (params?: Partial<Record<any, any>>) => Entity
  ) {}

  async deleteById(
    id: string
  ): Promise<boolean> {
    const result = this.repositoryService.deleteById(id);
    return result;
  }

  async findById(
    id: string
  ): Promise<Entity | null> {
    const result = await this.repositoryService.findById(id);
    return result ? new this.entity(result) : null;
  }
  /**
   * 
   * @param id 
   * @returns 
   */
  async findByIdStrict(
    id: string
  ): Promise<Entity> {
    const result = await this.findById(id);
    if (!result) {
      throw new Error("No user settings found.");
    }
    return result;
  }

  protected isNotEmpty (data: Record<any, any>) {
    return !!Object.keys(data).length;
  }
}