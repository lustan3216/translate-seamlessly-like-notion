import { readFileSync } from "node:fs";
import { networkInterfaces } from "node:os";
import { defineConfig, loadEnv, mergeConfig, type ConfigEnv, type Plugin, type PreviewOptions, type PreviewServer, type UserConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const accountPreviewWorker = "https://codex-creem-shared-account-anytranslator-api-dev.et3216-c0d.workers.dev";

function sharedAccountPreview(isolated: boolean): { options: PreviewOptions; guard: Plugin } {
  const siteOrigin = process.env.ACCOUNT_WEB_ORIGIN ?? "http://localhost:8080";
  if (!URL.canParse(siteOrigin)) throw new Error("Invalid isolated account preview origin");
  const site = new URL(siteOrigin);
  const local = site.hostname === "localhost";
  if (site.username || site.password || site.pathname !== "/" || site.search || site.hash
    || (isolated ? site.protocol !== "https:" : !local || site.protocol !== "http:")
    || (!local && !/^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:local|test)$/.test(site.hostname))) {
    throw new Error("Invalid isolated account preview origin");
  }

  const targetOrigin = process.env.SHARED_ACCOUNT_API_TARGET ?? accountPreviewWorker;
  if (!URL.canParse(targetOrigin)) throw new Error("Invalid account preview API target");
  const target = new URL(targetOrigin);
  const loopbackFixture = local && target.protocol === "http:" && target.hostname === "127.0.0.1" && target.port;
  if (target.username || target.password || target.pathname !== "/" || target.search || target.hash
    || !(target.origin === accountPreviewWorker || loopbackFixture)) {
    throw new Error("Account preview requires its branch Worker or a loopback fixture");
  }
  const token = process.env.SHARED_ACCOUNT_PROXY_TOKEN;
  if (!token || token.length < 32) throw new Error("Missing shared account preview proxy token");

  const host = local ? "127.0.0.1" : process.env.SHARED_ACCOUNT_PREVIEW_LAN_IP;
  if (!local && (!host || !/^(?:10\.|172\.(?:1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(host)
    || !Object.values(networkInterfaces()).flat().some((entry) => entry?.family === "IPv4" && entry.address === host))) {
    throw new Error("Set the account preview listener to this Mac’s private LAN IPv4 address");
  }
  const cert = process.env.SHARED_ACCOUNT_PREVIEW_TLS_CERT;
  const key = process.env.SHARED_ACCOUNT_PREVIEW_TLS_KEY;
  if (isolated && (!cert || !key)) throw new Error("Account preview requires a local TLS certificate and key");

  const guard = ({ middlewares }: Pick<PreviewServer, "middlewares">) => {
    middlewares.use((request, response, next) => {
      response.setHeader("Cache-Control", "no-store");
      response.setHeader("Referrer-Policy", "no-referrer");
      response.setHeader("X-Robots-Tag", "noindex, nofollow");
      // Keep production analytics and support scripts away from the test account session.
      response.setHeader("Content-Security-Policy", [
        "default-src 'self'", isolated ? "script-src 'self'" : "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:", "frame-ancestors 'none'", "base-uri 'none'", "form-action 'self'",
      ].join("; "));
      const origin = request.headers.origin;
      const fetchSite = request.headers["sec-fetch-site"];
      const url = request.url ?? "";
      const api = /^\/api\/account(?:\/|$)/.test(url);
      if (request.headers.host !== site.host || (origin && origin !== site.origin)
        || (api && ((fetchSite && fetchSite !== "same-origin")
          || !/^\/api\/account\/[a-z-]+(?:\/[a-z-]+)*$/.test(url)
          || (request.method !== "GET" && !(request.method === "POST" && origin === site.origin))))) {
        response.statusCode = 403;
        response.setHeader("Content-Type", "application/json");
        response.end('{"error":"invalid_preview_request"}');
        return;
      }
      delete request.headers["x-at-account-client-ip"];
      next();
    });
  };
  return {
    options: {
      host,
      port: site.port ? Number(site.port) : isolated ? 443 : 80,
      strictPort: true,
      cors: false,
      https: cert && key && isolated ? { cert: readFileSync(cert), key: readFileSync(key) } : undefined,
      proxy: {
        "^/api/account/": {
          target: target.origin,
          changeOrigin: true,
          proxyTimeout: 50_000,
          timeout: 50_000,
          rewrite: (url) => url.replace(/^\/api\/account\//, "/v1/account/"),
          headers: { "x-at-account-proxy-token": token },
        },
      },
    },
    guard: { name: "shared-account-preview", configureServer: guard, configurePreviewServer: guard },
  };
}

function accountPreviewConfig({ command, mode, isPreview }: ConfigEnv): UserConfig {
  const settings = loadEnv(mode, __dirname, "VITE_SHARED_ACCOUNT_");
  const live = mode === "account-live";
  const enabled = settings.VITE_SHARED_ACCOUNT_PREVIEW === "1";
  if (live && (command !== "build" || enabled || settings.VITE_SHARED_ACCOUNT_LIVE !== "1")) {
    throw new Error("Live accounts require an isolated live build");
  }
  if (!enabled && !live) return {};
  const isolated = live || mode === "account-preview";
  if (command === "build") {
    if (!isolated) return {};
    return {
      build: { outDir: live ? "dist-account-live" : "dist-account-preview", copyPublicDir: false, rollupOptions: { input: "./index.html" } },
      plugins: [{
        name: "shared-account-preview-assets",
        generateBundle() {
          for (const fileName of ["favicon.svg", "app-preview/logo.png"]) {
            this.emitFile({ type: "asset", fileName, source: readFileSync(path.resolve(__dirname, "public", fileName)) });
          }
        },
      }],
    };
  }
  if (isolated && !isPreview) throw new Error("Use vite preview for the isolated account build");
  if (!isolated && (mode !== "development" || isPreview)) return {};
  const { options, guard } = sharedAccountPreview(isolated);
  return { ...(isolated ? { preview: options } : { server: options }), plugins: [guard] };
}

// https://vitejs.dev/config/
export default defineConfig((env) => mergeConfig({
  base: '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    env.mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
        client: "./src/entry-client.tsx"
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: [
            '@radix-ui/react-accordion',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast'
          ],
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority'],
          icons: ['lucide-react'],
          helmet: ['react-helmet-async']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    target: 'es2015'
  },
  ssr: {
    noExternal: [
      "@radix-ui/react-accordion",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-aspect-ratio",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-collapsible",
      "@radix-ui/react-context-menu",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-hover-card",
      "@radix-ui/react-label",
      "@radix-ui/react-menubar",
      "@radix-ui/react-navigation-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-progress",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slider",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toast",
      "@radix-ui/react-toggle",
      "@radix-ui/react-toggle-group",
      "@radix-ui/react-tooltip",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
      "lucide-react"
    ]
  }
}, accountPreviewConfig(env)));
