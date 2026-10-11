const HugeIcon = ({ name, className = "h-4 w-4" }: { name: string; className?: string }) => {
  const mask = `url("/app-preview/icons/${name}.svg") center / contain no-repeat`;

  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 align-middle ${className}`}
      style={{ backgroundColor: "currentColor", mask, WebkitMask: mask }}
    />
  );
};

export default HugeIcon;
