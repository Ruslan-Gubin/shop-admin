import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  classImg?: string;
  classContainer?: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
};

const MainImage = (props: Props) => {
  return (
    <div className={props.classContainer}>
      <Image
        priority={props.priority}
        src={props.src}
        alt={props.alt}
        className={props.classImg}
        fill
        loading={props.loading === "lazy" ? "lazy" : "eager"}
        sizes="100%"
      />
    </div>
  );
};

export { MainImage };
