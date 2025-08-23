import { Context } from "hono";
import { FilesMetadataService } from "@/services/files-metadata";
import { ResponseHandler } from "@/utils/response-handler";
import { 
  createFileMetadataSchema, 
  updateFileMetadataSchema, 
  fileIdSchema 
} from "@/validations";

export class FilesMetadataController {
  constructor(private filesMetadataService: FilesMetadataService) {}

  async createFileMetadata(c: Context) {
    try {
      const body = await c.req.json();
      const validatedData = createFileMetadataSchema.parse(body);

      const success = await this.filesMetadataService.create(validatedData);
      
      if (!success) {
        return ResponseHandler.internalServer(c, "Failed to create file metadata");
      }

      return ResponseHandler.created(c, { 
        message: "File metadata created successfully",
        success: true 
      });
    } catch (error) {
      console.error("Error creating file metadata:", error);
      return ResponseHandler.badRequest(c, "Invalid input", error);
    }
  }

  async getFileMetadata(c: Context) {
    try {
      const id = c.req.param("id");
      const validatedId = fileIdSchema.parse({ id });

      const file = await this.filesMetadataService.findById(validatedId.id);
      
      if (!file) {
        return ResponseHandler.notFound(c, "File metadata not found");
      }

      return ResponseHandler.ok(c, file);
    } catch (error) {
      console.error("Error getting file metadata:", error);
      return ResponseHandler.badRequest(c, "Invalid request", error);
    }
  }

  async updateFileMetadata(c: Context) {
    try {
      const id = c.req.param("id");
      const body = await c.req.json();
      
      const validatedId = fileIdSchema.parse({ id });
      const validatedData = updateFileMetadataSchema.parse(body);

      const updatedFile = await this.filesMetadataService.update(validatedId.id, validatedData);
      
      if (!updatedFile) {
        return ResponseHandler.notFound(c, "File metadata not found or update failed");
      }

      return ResponseHandler.ok(c, {
        message: "File metadata updated successfully",
        data: updatedFile.toObject()
      });
    } catch (error) {
      console.error("Error updating file metadata:", error);
      return ResponseHandler.badRequest(c, "Invalid input", error);
    }
  }

  async markFileAsUploaded(c: Context) {
    try {
      const id = c.req.param("id");
      const validatedId = fileIdSchema.parse({ id });

      const success = await this.filesMetadataService.markFileAsUploaded(validatedId.id);
      
      if (!success) {
        return ResponseHandler.notFound(c, "File metadata not found or update failed");
      }

      return ResponseHandler.ok(c, {
        message: "File marked as uploaded successfully",
        success: true
      });
    } catch (error) {
      console.error("Error marking file as uploaded:", error);
      return ResponseHandler.badRequest(c, "Invalid request", error);
    }
  }

  async deleteFileMetadata(c: Context) {
    try {
      const id = c.req.param("id");
      const validatedId = fileIdSchema.parse({ id });

      const success = await this.filesMetadataService.deleteById(validatedId.id);
      
      if (!success) {
        return ResponseHandler.notFound(c, "File metadata not found or delete failed");
      }

      return ResponseHandler.ok(c, {
        message: "File metadata deleted successfully",
        success: true
      });
    } catch (error) {
      console.error("Error deleting file metadata:", error);
      return ResponseHandler.badRequest(c, "Invalid request", error);
    }
  }

  async listFilesMetadata(c: Context) {
    try {
      const query = c.req.query();
      const { uploaded, contentType, filename } = query;

      let files;
      
      if (uploaded === 'true') {
        files = await this.filesMetadataService.repositoryService.find([
          { fieldName: 'uploaded', value: true, operator: 'eq' }
        ]);
      } else if (uploaded === 'false') {
        files = await this.filesMetadataService.repositoryService.find([
          { fieldName: 'uploaded', value: false, operator: 'eq' }
        ]);
      } else if (contentType) {
        files = await this.filesMetadataService.repositoryService.find([
          { fieldName: 'contentType', value: contentType, operator: 'eq' }
        ]);
      } else if (filename) {
        files = await this.filesMetadataService.repositoryService.find([
          { fieldName: 'filename', value: filename, operator: 'eq' }
        ]);
      } else {
        files = await this.filesMetadataService.repositoryService.find();
      }

      return ResponseHandler.ok(c, {
        data: files,
        count: files.length
      });
    } catch (error) {
      console.error("Error listing files metadata:", error);
      return ResponseHandler.internalServer(c, "Failed to retrieve files metadata");
    }
  }
}