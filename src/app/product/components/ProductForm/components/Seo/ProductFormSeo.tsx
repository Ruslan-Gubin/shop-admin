import { CancelSvg } from "@/shared/svg/CancelSvg";
import { Input } from "@/shared/ui/input-main/Input";
import { FormSection } from "@/widgets/form-section/FormSection";

type Props = {
  values: {
    seo_title: string;
    seo_description: string;
    slug: string;
    og_title: string;
    og_description: string;
    og_type: string;
    keywords: string;
  };
  errors: {
    seo_title: string;
    seo_description: string;
    slug: string;
    og_title: string;
    og_description: string;
    og_type: string;
    keywords: string;
  };
  handleChangeValues: (field: string, value: string) => void;
};

export const ProductFormSeo = (props: Props) => {
  return (
    <FormSection title="SEO">
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
  );
};
