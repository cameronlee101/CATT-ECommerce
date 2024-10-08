"use client";

import { Categories } from "@/axios/filters.types";
import { getProductTags } from "@/axios/product";
import { CustomCheckbox } from "@/components/general";
import { CheckboxGroup } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import React from "react";

type TagsFilterProps = {
  selectedTags: string[];
  onChange(tags: string[]): void;
};

// Displays all the different tags a user can choose to filter products by
export function TagsFilter({ selectedTags, onChange }: TagsFilterProps) {
  const { data } = useQuery({
    queryKey: ["Product Tags"],
    queryFn: getProductTags,
  });

  return (
    <div className="flex flex-col gap-1 w-full mb-4">
      <CheckboxGroup
        className="gap-1"
        classNames={{ label: "text-black mb-2" }}
        label="Select Product Tags:"
        orientation="horizontal"
        name="product_tags"
        value={selectedTags}
        onChange={(value) => {
          onChange(value as string[]);
        }}
      >
        {data
          ?.filter((tag) => !Object.keys(Categories).includes(tag))
          ?.map((tag) => (
            <span key={tag}>
              <CustomCheckbox value={tag}>{tag}</CustomCheckbox>
            </span>
          ))}
      </CheckboxGroup>
    </div>
  );
}
