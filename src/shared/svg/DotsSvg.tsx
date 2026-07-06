export const DotsSvg = ({ fill }: { fill?: string }) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Действия</title>
      <circle cx="10" cy="3.5" r="1.8" fill={fill || "#727280"}></circle>
      <circle cx="10" cy="10" r="1.8" fill={fill || "#727280"}></circle>
      <circle cx="10" cy="16.5" r="1.8" fill={fill || "#727280"}></circle>
    </svg>
  );
};
