import { useState, useTransition } from "react";
import type { CategoryModel } from "@/app/category/action";
import type { SeoModel } from "@/app/product/action";
import type { ProductFormPayloadValues } from "@/app/product/create/action";
import { promptSeoFromProduct } from "@/app/product/prompt";
import { getCategoryFullPath } from "@/shared/helpers/getCategoryFullPath";
import { generateAnswer } from "@/shared/llm/generateAnswer";
import { AiSvg } from "@/shared/svg/AiSvg";
import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Button } from "@/shared/ui/button-main/Button";
import { Input } from "@/shared/ui/input-main/Input";
import { notificationAdapter } from "@/stores/notification/adapter";
import { FormSection } from "@/widgets/form-section/FormSection";
import { SeoRecommendationModal } from "./SeoRecommendationModal";

type SeoKey = keyof SeoModel;

type Props = {
  values: ProductFormPayloadValues;
  errors: Record<keyof ProductFormPayloadValues, string>;
  handleChangeValues: (field: string, value: string) => void;
  categories: CategoryModel[];
};

export const ProductFormSeo = (props: Props) => {
  const [isLoading, transition] = useTransition();
  const [recommendations, setRecommendations] = useState<SeoModel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGenerate = () => {
    transition(async () => {
      const prompt = await promptSeoFromProduct({
        name: props.values.name,
        description: props.values.description || undefined,
        brand_name: props.values.brand_name || undefined,
        category_name: getCategoryFullPath(props.categories, props.values.category_id) || undefined,
        seo: {
          seo_title: props.values.seo_title,
          seo_description: props.values.seo_description,
          slug: props.values.slug,
          og_title: props.values.og_title,
          og_description: props.values.og_description,
          og_type: props.values.og_type,
          keywords: props.values.keywords,
        },
      });

      if (prompt.length > 0) {
        await generateAnswer<SeoModel>(prompt)
          .then((response) => {
            if (Object.hasOwn(response, "answer")) {
              setRecommendations({
                seo_title: response.answer?.seo_title || "",
                seo_description: response.answer?.seo_description || "",
                slug: response.answer?.slug || "",
                og_title: response.answer?.og_title || "",
                og_description: response.answer?.og_description || "",
                og_type: response.answer?.og_type || "",
                keywords: response.answer?.keywords || "",
              });
              setIsModalOpen(true);
            } else {
              throw "Не удалось сгенерировать SEO";
            }
          })
          .catch((error) => {
            notificationAdapter.add(error, "error");
          });
      }
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRecommendations(null);
  };

  const handleApplyField = (field: SeoKey, value: string) => {
    props.handleChangeValues(field, value);
  };

  const handleApplyAll = (seo: SeoModel) => {
    for (const key in seo) {
      props.handleChangeValues(key, seo[key as SeoKey]);
    }
  };

  return (
    <>
      <SeoRecommendationModal
        isOpen={isModalOpen}
        recommendations={recommendations}
        currentValues={props.values}
        onClose={handleCloseModal}
        onApplyField={handleApplyField}
        onApplyAll={handleApplyAll}
      />
      <FormSection title="SEO">
        <Button
          variant="solid"
          variantColor="blue"
          size="sm"
          onClick={handleGenerate}
          disabled={isLoading || !props.values.name}
        >
          <div className="buttonContentIcon">
            <div>{isLoading ? <div className="spinner" /> : <AiSvg />}</div>
            <p>Сгенерировать SEO</p>
          </div>
        </Button>
        <Input
          name="seo_title"
          id="seo_title"
          variant="outlined"
          variantSize="sm"
          label="SEO заголовок"
          rightIcon={<CancelSvg />}
          onClickRightIcon={() => props.handleChangeValues("seo_title", "")}
          onChange={(e) => props.handleChangeValues("seo_title", e.target.value)}
          error={props.errors.seo_title}
          value={props.values.seo_title}
        />
        <Input
          name="seo_description"
          id="seo_description"
          variant="outlined"
          variantSize="sm"
          label="SEO описание"
          rightIcon={<CancelSvg />}
          onClickRightIcon={() => props.handleChangeValues("seo_description", "")}
          onChange={(e) => props.handleChangeValues("seo_description", e.target.value)}
          error={props.errors.seo_description}
          value={props.values.seo_description}
        />
        <Input
          name="slug"
          id="slug"
          variant="outlined"
          variantSize="sm"
          label="Slug"
          rightIcon={<CancelSvg />}
          onClickRightIcon={() => props.handleChangeValues("slug", "")}
          onChange={(e) => props.handleChangeValues("slug", e.target.value)}
          error={props.errors.slug}
          value={props.values.slug}
        />
        <Input
          name="og_title"
          id="og_title"
          variant="outlined"
          variantSize="sm"
          label="OG заголовок"
          rightIcon={<CancelSvg />}
          onClickRightIcon={() => props.handleChangeValues("og_title", "")}
          onChange={(e) => props.handleChangeValues("og_title", e.target.value)}
          error={props.errors.og_title}
          value={props.values.og_title}
        />
        <Input
          name="og_description"
          id="og_description"
          variant="outlined"
          variantSize="sm"
          label="OG описание"
          rightIcon={<CancelSvg />}
          onClickRightIcon={() => props.handleChangeValues("og_description", "")}
          onChange={(e) => props.handleChangeValues("og_description", e.target.value)}
          error={props.errors.og_description}
          value={props.values.og_description}
        />
        <Input
          name="og_type"
          id="og_type"
          variant="outlined"
          variantSize="sm"
          label="OG тип"
          rightIcon={<CancelSvg />}
          onClickRightIcon={() => props.handleChangeValues("og_type", "")}
          onChange={(e) => props.handleChangeValues("og_type", e.target.value)}
          error={props.errors.og_type}
          value={props.values.og_type}
        />
        <Input
          name="keywords"
          id="keywords"
          variant="outlined"
          variantSize="sm"
          label="Ключевые слова"
          rightIcon={<CancelSvg />}
          onClickRightIcon={() => props.handleChangeValues("keywords", "")}
          onChange={(e) => props.handleChangeValues("keywords", e.target.value)}
          error={props.errors.keywords}
          value={props.values.keywords}
        />
      </FormSection>
    </>
  );
};
