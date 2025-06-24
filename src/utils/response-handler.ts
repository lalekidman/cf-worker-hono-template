import { Context, Next } from "hono";

export interface IErrorResponse {
  error: string;
  details?: any;
}

class ErrorResponse implements IErrorResponse {
  constructor(
    public readonly error: string,
    public details?: any
  ) {
  }
}



export class ResponseHandler {

  static default(context: Context, data: any, statusCode: number = 200): Response {
    return context.json(data, statusCode as any);
  }

  static created(context: Context, data: any): Response {
    return ResponseHandler.default(context, data, 201);
  }

  static success(context: Context, data: any): Response {
    return ResponseHandler.default(context, data, 200);
  }

  static badRequest(context: Context, message: string, details?: any): Response {
    return ResponseHandler.default(context, new ErrorResponse(message, details), 400);
  }

  static notFound(context: Context, message: string = "Resource not found"): Response {
    return ResponseHandler.default(context, new ErrorResponse(message), 400);
  }

  static conflict(context: Context, message: string): Response {
    return ResponseHandler.default(context, new ErrorResponse(message), 409);
  }

  static internalServer(context: Context, message: string): Response {
    return ResponseHandler.default(context, new ErrorResponse(message), 500);
  }

  static unauthorized(context: Context, message: string, details?: any): Response {
    return ResponseHandler.default(context, new ErrorResponse(message, details), 401);
  }

  static forbidden(context: Context, message: string, details?: any): Response {
    return ResponseHandler.default(context, new ErrorResponse(message, details), 403);
  }

  static async handleError(next: Next, error: unknown, defaultMessage: string, statusCode: number = 500) {
    console.error(`${defaultMessage}:`, error);
    await next();
    return;
  }
}