import { IFilesMetadataBase } from "@/entities/files-metadata";
import { IBaseRepositoryService } from "@/utils/repository/interfaces.repository";

export interface IFilesMetadataRepositoryService extends IBaseRepositoryService<IFilesMetadataBase> {
  // markAsUploaded(id: string): Promise<boolean>;
  // findByFilename(filename: string): Promise<IFilesMetadataBase[]>;
  // findByContentType(contentType: string): Promise<IFilesMetadataBase[]>;
  // findUploaded(): Promise<IFilesMetadataBase[]>;
  // findPending(): Promise<IFilesMetadataBase[]>;
}