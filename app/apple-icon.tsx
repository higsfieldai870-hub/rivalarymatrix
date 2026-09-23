import { logoIcon } from "@/app/components/og/logo-icon";

// iOS fills transparency with black or white, so give it the site background.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return logoIcon(size.width, "#050706");
}
