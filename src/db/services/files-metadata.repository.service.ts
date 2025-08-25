import { BaseRepositoryService } from "@/utils/repository/service.repository";
import {
  IFilesMetadataBase
} from '@/entities/files-metadata'
import { DB } from '../index'
import { filesMetadataSchema } from "../schemas";
// import { Connection, RelayPagination, RelayPaginationArgs } from "@/utils/pagination";
// import { and, inArray, SQL } from "drizzle-orm";
import { IFilesMetadataFindOneLatestByResourceOpt, IFilesMetadataRepositoryService } from "@/services/files-metadata/interfaces";
import { and, desc, eq } from "drizzle-orm";

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
  async findOneLatestByResource (
    resourceType: string,
    resourceId: string,
    opt?: IFilesMetadataFindOneLatestByResourceOpt
  ) {
    const {
      purpose,
      status
    } = opt || {};
    const result = await this.db
      .select()
      .from(filesMetadataSchema)
      .where(and(
        eq(filesMetadataSchema.resourceType, resourceType),
        eq(filesMetadataSchema.resourceId, resourceId),
        ...(status ? [eq(filesMetadataSchema.status, status)] : []),
        ...(purpose ? [eq(filesMetadataSchema.purpose, purpose)] : []),
      ))
      .orderBy(desc(filesMetadataSchema.createdAt));
    return result.length >= 1 ? result[0] : null;
  }
}