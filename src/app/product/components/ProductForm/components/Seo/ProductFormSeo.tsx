import { useState } from "react";
import type { CategoryModel } from "@/app/category/action";
import {
  getSeoSuggestionAction,
  type SeoModel,
  type SeoSuggestionPayload,
} from "@/app/product/action";
import type { ProductFormPayloadValues } from "@/app/product/create/action";
import { getCategoryFullPath } from "@/shared/helpers/getCategoryFullPath";
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
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<SeoModel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGenerate = () => {
    const payload: SeoSuggestionPayload = {
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
    };

    setIsLoading(true);

    getSeoSuggestionAction(payload)
      .then((response) => {
        if (response.status === "success" && response.data) {
          setRecommendations({
            seo_title: response.data?.seo_title || "",
            seo_description: response.data?.seo_description || "",
            slug: response.data?.slug || "",
            og_title: response.data?.og_title || "",
            og_description: response.data?.og_description || "",
            og_type: response.data?.og_type || "",
            keywords: response.data?.keywords || "",
          });
          setIsModalOpen(true);
        } else {
          notificationAdapter.add(
            response.message || "Не удалось сгенерировать SEO",
            response.status,
          );
        }
      })
      .finally(() => {
        setIsLoading(false);
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
