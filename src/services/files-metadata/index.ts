import { IFilesMetadataBase, IFilesMetadataEntity, FilesMetadataEntity, FileStatus } from '@/entities/files-metadata'
import { IFilesMetadataInput, IFilesMetadataRepositoryService } from './interfaces'
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
    await this.repositoryService.update(id, data);
    return entity;
  }

  async markFileAsUploaded(id: string): Promise<boolean> {
    return this.repositoryService.update(id, {
      status: FileStatus.COMPLETED
    });
  }
}