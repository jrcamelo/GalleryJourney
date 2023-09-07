/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_BACK_API: string
  readonly VITE_DEFAULT_SERVER: string
  readonly VITE_DEFAULT_DISCORD_AVATAR: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}