import Image from "next/image";
import { assetPath } from "@/config/site";

type SocialIconProps = {
  platform: "whatsapp" | "instagram";
  size?: number;
};

export function SocialIcon({ platform, size = 20 }: SocialIconProps) {
  return (
    <Image
      className={`social-icon social-icon--${platform}`}
      src={assetPath(`/assets/icons/${platform}.png`)}
      alt=""
      width={size}
      height={size}
      aria-hidden="true"
      unoptimized
    />
  );
}

