import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from "vite"

// Dev-only: run the Vercel Edge function (api/aria.ts) inside Vite's dev server,
// so `npm run dev` fully exercises A.R.I.A locally without needing `vercel dev`.
// In production, Vercel serves api/* natively and this plugin isn't used.
function ariaDevApi(env: Record<string, string>): Plugin {
  // Make .env.local values (GROQ_API_KEY, etc.) visible to the handler.
  for (const [k, v] of Object.entries(env)) {
    if (!(k in process.env)) process.env[k] = v
  }
  return {
    name: "aria-dev-api",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api/aria", async (req, res) => {
        try {
          const chunks: Buffer[] = []
          for await (const c of req) chunks.push(c as Buffer)
          const request = new Request(`http://localhost${req.url}`, {
            method: req.method,
            headers: req.headers as Record<string, string>,
            body: chunks.length ? Buffer.concat(chunks) : undefined,
          })
          // Load the TS handler through Vite (transpiles on the fly).
          const mod = await server.ssrLoadModule("/api/aria.ts")
          const response: Response = await mod.default(request)
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          if (response.body) {
            const reader = response.body.getReader()
            for (;;) {
              const { done, value } = await reader.read()
              if (done) break
              res.write(Buffer.from(value))
            }
          }
          res.end()
        } catch (err) {
          console.error("[aria-dev-api]", err)
          res.statusCode = 500
          res.end("aria dev api error")
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  return {
    plugins: [react(), tailwindcss(), ariaDevApi(env)],
    resolve: {
      alias: {
        "@": new URL("./src", import.meta.url).pathname,
      },
    },
  }
})
