

interface AvatarProps {
  name: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ name, className = '' }) => {
  const getInitial = (name: string) => {
    return name?.trim().charAt(0).toUpperCase() || '?';
  };

  const getColorFromName = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 80%, 30%)`; // Hue shift with pastel tone
    return color;
  };

  const bgColor = getColorFromName(name);

  return (
    <div
      className={`flex items-center justify-center text-white font-semibold ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {getInitial(name)}
    </div>
  );
};

export default Avatar;
