"use client";

import { getProductTags } from "@/api/product";
import { CustomCheckbox } from "@/components/general";
import { CheckboxGroup } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import React from "react";

type TagsFilterProps = {
  selectedTags: string[];
  onChange(tags: string[]): void;
};

export function TagsFilter({ selectedTags, onChange }: TagsFilterProps) {
  const { data } = useQuery({
    queryKey: ["Product Tags"],
    queryFn: getProductTags,
  });

  return (
    <div className="flex flex-col gap-1 w-full mb-4">
      <CheckboxGroup
        className="gap-1"
        label="Select Product Tags"
        orientation="horizontal"
        name="product_tags"
        value={selectedTags}
        onChange={(value) => {
          onChange(value as string[]);
        }}
      >
        {data?.map((tag) => <CustomCheckbox value={tag}>{tag}</CustomCheckbox>)}
      </CheckboxGroup>
    </div>
  );
}
