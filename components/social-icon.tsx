type SocialIconProps = {
  platform: "whatsapp" | "instagram";
  size?: number;
};

export function SocialIcon({ platform, size = 20 }: SocialIconProps) {
  return (
    <Image
      className={`social-icon social-icon--${platform}`}
      src={`/assets/icons/${platform}.png`}
      alt=""
      width={size}
      height={size}
      aria-hidden="true"
      unoptimized
    />
  );
}
import Image from "next/image";

