import { IFilesMetadataBase, IFilesMetadataEntity, FilesMetadataEntity, FileStatus } from '@/entities/files-metadata'
import { IFilesMetadataInput, IFilesMetadataRepositoryService, IGetOneLatestByResourceOpt } from './interfaces'
import { BaseService } from '@/utils/services/service'

export class FilesMetadataService extends BaseService<IFilesMetadataBase, IFilesMetadataEntity> {
  constructor(
    protected readonly repositoryService: IFilesMetadataRepositoryService
  ) {
    super(FilesMetadataEntity)
  }

  async create(
    data: IFilesMetadataInput
  ): Promise<FilesMetadataEntity> {
    try {
      const entity = new FilesMetadataEntity(data);
      await this.repositoryService.insert(entity.toObject());
      return entity;
    } catch (error) {
      console.log('Failed to create filemetadata. Error :>> ', error);
      throw error;
    }
  }
  async findOneOrCreate (
    data: IFilesMetadataInput
  ): Promise<FilesMetadataEntity>  {
    // check if there's if there's any existing pending file.
    const file = await this.getOneLatestByResource(data.resourceType, data.resourceId, {
      purpose: data.purpose,
      status: FileStatus.PENDING
    });
    if (file) {
      return file;
    }
    return this.create(data);
  }

  async update(id: string, data: Partial<IFilesMetadataBase>): Promise<FilesMetadataEntity|null> {
    const entity = await this.findByIdStrict(id);
    if (!this.isNotEmpty(data)) {
      return null;
    }
    entity.update();
    data.filename && (entity.filename = data.filename);
    data.filepath && (entity.filepath = data.filepath);
    data.filesize && (entity.filesize = data.filesize);
    data.contentType && (entity.contentType = data.contentType);
    data.status && (entity.status = data.status);
    data.resourceType && (entity.resourceType = data.resourceType);
    data.resourceId && (entity.resourceId = data.resourceId);
    data.purpose && (entity.purpose = data.purpose);
    await this.repositoryService.update(id, data);
    return entity;
  }

  async markAsActive(id: string): Promise<boolean> {
    return this.repositoryService.update(id, {
      status: FileStatus.ACTIVE
    });
  }

  async getOneLatestByResource (
    resourceType: string,
    resourceId: string,
    opt?: IGetOneLatestByResourceOpt
  ) {
    const result = await this.repositoryService.findOneLatestByResource(resourceType, resourceId, opt);
    return result ? new FilesMetadataEntity(result) : null;

  }
  async getOneLatestActiveByResource (
    resourceType: string,
    resourceId: string,
    opt?: Omit<IGetOneLatestByResourceOpt, 'status'>
  ) {
    return this.getOneLatestByResource(resourceType, resourceId, {
      ...(opt || {}),
      status: FileStatus.ACTIVE
    });
  }
}