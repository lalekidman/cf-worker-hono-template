import { Context } from "hono";
import { createDB, DB } from "@/apps/database";

// Import services as they are created
// import { ApplicationService } from "@/application-management/use-cases/service";
// import { ApplicationRepositoryService } from "@/apps/database/repositories/application.repository.service";

export class ServiceFactory {
  private db: DB;
  // private _applicationService: ApplicationService | null = null;

  constructor(c: Context) {
    this.db = createDB(c.env.DB);
  }

  // makeApplicationService(): ApplicationService {
  //   if (!this._applicationService) {
  //     const repository = new ApplicationRepositoryService(this.db);
  //     this._applicationService = new ApplicationService(repository);
  //   }
  //   return this._applicationService;
  // }
}