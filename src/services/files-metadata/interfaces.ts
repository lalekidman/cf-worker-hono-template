import { FileStatus, IFilesMetadataBase } from "@/entities/files-metadata";
import { IBaseRepositoryService } from "@/utils/repository/interfaces.repository";

export interface IFilesMetadataInput extends Pick<IFilesMetadataBase,
| 'filename'
| 'filepath'
| 'filesize'
| 'contentType'
| 'bucketName'
| 'resourceType'
| 'resourceId'
| 'purpose'
> {
  expiresIn?: number
}

export interface IGetOneLatestByResourceOpt {
  status?: FileStatus
  purpose?: string
}
export interface IFilesMetadataFindOneLatestByResourceOpt extends IGetOneLatestByResourceOpt {
}

export interface IFilesMetadataRepositoryService extends IBaseRepositoryService<IFilesMetadataBase> {
  // markAsUploaded(id: string): Promise<boolean>;
  // findByFilename(filename: string): Promise<IFilesMetadataBase[]>;
  // findByContentType(contentType: string): Promise<IFilesMetadataBase[]>;
  // findUploaded(): Promise<IFilesMetadataBase[]>;
  // findPending(): Promise<IFilesMetadataBase[]>;
  findOneLatestByResource (
    resourceType: string,
    resourceId: string,
    opt?: IFilesMetadataFindOneLatestByResourceOpt
  ): Promise<IFilesMetadataBase|null>
}