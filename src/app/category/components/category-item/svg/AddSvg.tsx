export const AddSvg = ({ fill }: { fill?: string }) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Добавить</title>
      <path d="M17 11H11V17H9V11H3V9H9V3H11V9H17V11Z" fill={fill || "currentColor"}></path>
    </svg>
  );
};
