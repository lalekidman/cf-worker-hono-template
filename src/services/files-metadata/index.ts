import { IFilesMetadataBase, IFilesMetadataEntity, FilesMetadataEntity } from '@/entities/files-metadata'
import { IFilesMetadataRepositoryService } from './interfaces'
import { BaseService } from '@/utils/services/service'

export class FilesMetadataService extends BaseService<IFilesMetadataBase, IFilesMetadataEntity> {
  constructor(
    protected readonly repositoryService: IFilesMetadataRepositoryService
  ) {
    super(FilesMetadataEntity)
  }

  async create(data: Omit<IFilesMetadataBase, 'id' | 'createdAt' | 'updatedAt' | '_v' | 'uploaded'>): Promise<FilesMetadataEntity> {
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
    typeof data.uploaded === 'boolean' && (entity.uploaded = data.uploaded);
    await this.repositoryService.update(id, data);
    return entity;
  }

  async markFileAsUploaded(id: string): Promise<boolean> {
    return this.repositoryService.update(id, {
      uploaded: true
    });
  }
}