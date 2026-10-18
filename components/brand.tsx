export function Brand({ inverse = false }: { inverse?: boolean }) { return <span className={`brand ${inverse ? "brand--inverse" : ""}`} aria-label="H9">H<span>9</span></span>; }
