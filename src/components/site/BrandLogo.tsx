import logoAsset from "@/assets/status-immigration-law-firm-logo.png.asset.json";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ className = "h-12 w-12", priority = false }: BrandLogoProps) {
  return (
    <img
      src={logoAsset.url}
      alt="Status Immigration Law Firm"
      width={627}
      height={627}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={`shrink-0 object-contain ${className}`}
    />
  );
}