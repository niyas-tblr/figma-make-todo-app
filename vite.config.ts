import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Check if the system Supabase info file exists (Figma environment)
// If not, we're likely in a local/Vercel environment and need to shim it
const supabaseInfoPath = path.resolve(__dirname, './utils/supabase/info.tsx');
const hasSystemSupabaseInfo = fs.existsSync(supabaseInfoPath);

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
      // If the system Supabase file is missing, alias the import to our local shim
      // that uses import.meta.env
      ...(!hasSystemSupabaseInfo ? {
        '/utils/supabase/info': path.resolve(__dirname, './src/lib/supabase-env.ts')
      } : {})
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
