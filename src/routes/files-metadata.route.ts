import { Hono } from "hono";
import { FilesMetadataController } from "@/controllers/files-metadata.controller";
// Note: This would need proper dependency injection setup
// import { filesMetadataService } from "@/services";

const filesMetadataRoute = new Hono();

// Placeholder controller - would need DI setup
const controller = new (class {
  async createFileMetadata(c: any) {
    return c.json({ error: "FilesMetadataService dependency injection not configured" }, 500);
  }
  async getFileMetadata(c: any) {
    return c.json({ error: "FilesMetadataService dependency injection not configured" }, 500);
  }
  async updateFileMetadata(c: any) {
    return c.json({ error: "FilesMetadataService dependency injection not configured" }, 500);
  }
  async markFileAsUploaded(c: any) {
    return c.json({ error: "FilesMetadataService dependency injection not configured" }, 500);
  }
  async deleteFileMetadata(c: any) {
    return c.json({ error: "FilesMetadataService dependency injection not configured" }, 500);
  }
  async listFilesMetadata(c: any) {
    return c.json({ error: "FilesMetadataService dependency injection not configured" }, 500);
  }
})();

// When DI is configured, replace above with:
// const controller = new FilesMetadataController(filesMetadataService);

// Routes
filesMetadataRoute.post("/", controller.createFileMetadata.bind(controller));
filesMetadataRoute.get("/", controller.listFilesMetadata.bind(controller));
filesMetadataRoute.get("/:id", controller.getFileMetadata.bind(controller));
filesMetadataRoute.put("/:id", controller.updateFileMetadata.bind(controller));
filesMetadataRoute.patch("/:id/mark-completed", controller.markFileAsUploaded.bind(controller));
filesMetadataRoute.delete("/:id", controller.deleteFileMetadata.bind(controller));

export { filesMetadataRoute };