import { BaseRepositoryService } from "@/utils/repository/service.repository";
import {
  IFilesMetadataBase
} from '@/entities/files-metadata'
import { DB } from '../index'
import { filesMetadataSchema } from "../schemas";
// import { Connection, RelayPagination, RelayPaginationArgs } from "@/utils/pagination";
// import { and, inArray, SQL } from "drizzle-orm";
import { IFilesMetadataRepositoryService } from "@/services/files-metadata/interfaces";

export class FilesMetadataRepositoryService extends BaseRepositoryService<IFilesMetadataBase> implements IFilesMetadataRepositoryService {
  constructor (db: DB) {
    super(db, filesMetadataSchema)
  }
  // public async listRelay (opt: IApplicationListRelayOption) {
  //   const {
  //     owners,
  //     ..._opt
  //   } = opt || {};
  //   const conditions:SQL[] = [];
  //   if (owners?.length) {
  //     conditions.push(inArray(applicationTable.owner, owners));
  //   }
  //   return (await this.relayPagination.paginate(conditions, _opt, {
  //     defaultLimit: 20,
  //     maxLimit: 100,
  //     includeTotalCount: true,
  //     cursorField: [
  //       'createdAt'
  //     ]
  //   }) as Connection<IApplication> );
  // }
}