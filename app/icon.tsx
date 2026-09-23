import { logoIcon } from "@/app/components/og/logo-icon";

export const size = { width: 96, height: 96 };
export const contentType = "image/png";

export default function Icon() {
  return logoIcon(size.width);
}
