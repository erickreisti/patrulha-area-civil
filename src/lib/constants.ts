// src/lib/constants.ts
export const AVATAR_CONFIG = {
  DEFAULT: {
    AGENT: "/images/avatars/default/default_agent.webp",
    ADMIN: "/images/avatars/default/default_admin.webp",
    USER: "/images/avatars/default/default_user.webp",
  },
  PLACEHOLDERS: {
    AGENT: "/images/avatars/placeholders/agent_placeholder.webp",
    ADMIN: "/images/avatars/placeholders/admin_placeholder.webp",
  },
  SIZES: {
    THUMB: { width: 128, height: 128 },
    MEDIUM: { width: 256, height: 256 },
    LARGE: { width: 512, height: 512 },
  },
} as const;
