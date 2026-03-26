const PRODUCTION_HOSTS = new Set(["www.gozoshe.com", "gozoshe.com"]);

export const getEnvironmentLabel = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const { hostname } = window.location;

  if (PRODUCTION_HOSTS.has(hostname)) {
    return null;
  }

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "本機";
  }

  return "測試";
};

export const EnvironmentInlineTag = ({
  className = "",
}: {
  className?: string;
}) => {
  const label = getEnvironmentLabel();

  if (!label) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[10px] font-black tracking-[0.2em] text-orange-600 ${className}`}
    >
      {label}
    </span>
  );
};
