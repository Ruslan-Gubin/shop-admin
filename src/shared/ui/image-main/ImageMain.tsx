import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  classImg?: string;
  classContainer?: string;
  priority?: boolean;
};

const MainImage = ({ priority, classContainer, classImg, alt, src }: Props) => {
  return (
    <div className={classContainer}>
      <Image
        priority={priority}
        src={src}
        alt={alt}
        className={classImg}
        fill
        sizes="100%"
      />
    </div>
  );
};

export { MainImage };
