import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: 'localhost',
    port: 5173
  },
  // build: {
  //   rollupOptions: {
  //     output: {
  //       manualChunks: {
  //         // Separate admin components into their own chunk
  //         admin: [
  //           './src/components/Admin/AdminChallenges.tsx',
  //           './src/components/Admin/Users.tsx',
  //           './src/components/Admin/Dashboard.tsx',
  //           './src/components/Admin/addChallenges.tsx',
  //           './src/components/Admin/ChallengeDetails.tsx',
  //           './src/components/Admin/sidebar.tsx',
  //           './src/components/Admin/index.tsx',
  //           './src/components/Admin/home.tsx',
  //           './src/components/Admin/datepicker.tsx',
  //           './src/components/Admin/shared/AnimatedCounter.tsx',
  //           './src/components/Admin/shared/Badge.tsx',
  //           './src/components/Admin/shared/Button.tsx',
  //           './src/components/Admin/shared/SkeletonLoader.tsx',
  //           './src/components/Admin/shared/types.ts'
  //         ],
  //         // Separate vendor libraries
  //         vendor: [
  //           'react', 
  //           'react-dom', 
  //           'react-router-dom', 
  //           'react-hot-toast', 
  //           'lucide-react', 
  //           'react-icons',
  //           // Radix UI components
  //           '@radix-ui/react-avatar',
  //           '@radix-ui/react-checkbox',
  //           '@radix-ui/react-dialog',
  //           '@radix-ui/react-label',
  //           '@radix-ui/react-popover',
  //           '@radix-ui/react-progress',
  //           '@radix-ui/react-radio-group',
  //           '@radix-ui/react-scroll-area',
  //           '@radix-ui/react-select',
  //           '@radix-ui/react-slider',
  //           '@radix-ui/react-slot',
  //           '@radix-ui/react-tabs',
  //           '@radix-ui/react-toast',
  //           '@radix-ui/react-tooltip',
  //           // Other React UI libraries
  //           'framer-motion',
  //           'react-chartjs-2',
  //           'react-easy-crop',
  //           'recharts',
  //           '@tsparticles/react',
  //           '@tsparticles/slim',
  //           // Utility libraries
  //           'clsx',
  //           'tailwind-merge',
  //           'class-variance-authority',
  //           'zustand',
  //           'axios',
  //           'js-cookie'
  //         ],
  //       }
  //     }
  //   },
  //   chunkSizeWarningLimit: 1000
  // }
})