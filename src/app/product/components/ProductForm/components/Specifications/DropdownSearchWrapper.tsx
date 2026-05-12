"use client";
import { useState } from "react";
import { fetchSpecificationsClient, type SpecificationModel } from "@/app/specifications/action";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { DropdownSearch } from "@/shared/ui/dropdown-search/DropdownSearch";

type Props = {
  index: number;
  specifications: SpecificationModel[];
  selectedSpecifications: number[];
  onSelectSpecificationAction: (
    index: number,
    specificationId: number | null,
    label: string,
  ) => void;
  selectId: number | null;
  label: string;
};

export const DropdownSearchWrapper = (props: Props) => {
  const debounceFn = useDebounce();
  const [search, setSearch] = useState<string>(props.label);
  const [searchItems, setSearchItems] = useState<{ label: string; value: number }[]>([]);

  const options = props.specifications.map((el) => ({ value: el.id, label: el.name }));

  const handleSelectMenu = (value: number) => {
    const findOption = options.find((el) => el.value === value);

    if (findOption) {
      setSearch(findOption.label);
      props.onSelectSpecificationAction(props.index, findOption.value, findOption.label);
    } else {
      const findSearchItem = searchItems.find((el) => el.value === value);
      if (findSearchItem) {
        setSearch(findSearchItem.label);
        props.onSelectSpecificationAction(props.index, findSearchItem.value, findSearchItem.label);
      }
    }

    if (searchItems.length > 0) {
      setSearchItems([]);
    }
  };

  const onSearchInput = (value: string) => {
    fetchSpecificationsClient(value).then((response) => {
      setSearchItems(response.map((el) => ({ value: el.id, label: el.name })));
    });
  };

  const handleChangeSearch = (value: string) => {
    setSearch(value);
    props.onSelectSpecificationAction(props.index, null, value);

    if (value.length < 3) {
      setSearchItems([]);
    }

    if (value.length >= 3) {
      debounceFn(() => onSearchInput(value));
    }
  };

  const searchOptions = searchItems.length > 0 ? searchItems : options;
  const filteredSelectedOptions = searchOptions.filter(
    (el) => !props.selectedSpecifications.includes(el.value),
  );

  return (
    <DropdownSearch
      options={filteredSelectedOptions}
      value={props.selectId}
      disabled={false}
      menuHeight={300}
      placeholder="Характеристика"
      onSelectMenu={handleSelectMenu}
      onChangeValue={handleChangeSearch}
      inputValue={search}
    />
  );
};
