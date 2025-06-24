import { Context, ErrorHandler } from "hono";
import { ZodError } from "zod";
import { ResponseHandler } from "@/utils/response-handler";

export const errorController = async (err: ErrorHandler, c: Context) => {
  console.error(err);
  if (err instanceof ZodError) {
    return ResponseHandler.badRequest(c, "Invalid input", err.errors);
  }
  // add more logs here for debugging
  // just return internal server error in production
  if (c.env.NODE_ENV === "production") {
    return ResponseHandler.internalServer(c, "Internal Server Error");
  }
  if (err instanceof Error) {
    return ResponseHandler.internalServer(c, err.message);
  }
  return ResponseHandler.internalServer(c, "Internal Server Error");
}