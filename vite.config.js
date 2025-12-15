import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // Proxy for Riot Games APIs to avoid CORS
      '/riot-proxy': {
        target: 'https://entitlements.auth.riotgames.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/riot-proxy/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Forward all headers from original request
            Object.keys(req.headers).forEach((key) => {
              proxyReq.setHeader(key, req.headers[key]);
            });
          });
        },
      },
      '/riot-pd-proxy': {
        target: 'https://pd.na.a.pvp.net',
        changeOrigin: true,
        rewrite: (path) => {
          // Extract region and path from the rewritten path
          const match = path.match(/^\/riot-pd-proxy\/([^/]+)(\/.*)$/);
          if (match) {
            const [, region, restPath] = match;
            return restPath;
          }
          return path.replace(/^\/riot-pd-proxy/, '');
        },
        router: (req) => {
          // Dynamically set target based on region in path
          const match = req.url.match(/^\/riot-pd-proxy\/([^/]+)/);
          if (match) {
            const region = match[1];
            return `https://pd.${region}.a.pvp.net`;
          }
          return 'https://pd.na.a.pvp.net';
        },
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Forward all headers from original request
            Object.keys(req.headers).forEach((key) => {
              if (key.toLowerCase() !== 'host') {
                proxyReq.setHeader(key, req.headers[key]);
              }
            });
          });
        },
      },
    },
  },
});
