import { useState } from "react";
import { FormInstruction } from "@/widgets/form-instruction/FormInstruction";
import { FormSection } from "@/widgets/form-section/FormSection";

type Props = {
  initPhotos: string[];
};

export const ProductFormPhotos = (props: Props) => {
  const [photos, setPhotos] = useState<string[]>([]);

  return (
    <FormSection title="Фото товара">
      <FormInstruction>
        <span>PNG или JPEG с размером до 15 мб..</span>
      </FormInstruction>
      <div
        style={{
          border: "1px solid black",
          borderRadius: "4px",
          width: "100px",
          height: "100px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        +
      </div>
    </FormSection>
  );
};
