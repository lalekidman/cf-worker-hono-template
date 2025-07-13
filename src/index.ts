import app from "./app"

export default {
  async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext) {
    const url = new URL(request.url)
    const pathname = url.pathname
    const dropFirstSegment = env.DROP_FIRST_SEGMENT && env.DROP_FIRST_SEGMENT === "true" || false;

    if (dropFirstSegment) {
      // Remove first segment from path
      const segments = pathname.split('/').filter(Boolean)
      const strippedPath = '/' + segments.slice(1).join('/')
  
      // Rewrite the URL
      url.pathname = strippedPath
    }

    // Reconstruct the Request with the modified URL
    const newRequest = new Request(url.toString(), request)

    return app.fetch(newRequest, env, ctx)
  }
}