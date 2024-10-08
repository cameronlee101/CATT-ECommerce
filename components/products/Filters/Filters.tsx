"use client";

import { Button, Card, CardBody } from "@nextui-org/react";
import React, { useState } from "react";
import { PriceFilter } from "./PriceFilter";
import { RatingFilter } from "./RatingFilter";
import { FiltersType } from "@/axios/filters.types";
import { TagsFilter } from "./TagsFilter";

type FiltersProps = {
  onFiltersSave: (values: FiltersType) => void;
};

// Displays all of the different filters the user can use to filter what products are displays
export function Filters({ onFiltersSave }: FiltersProps) {
  const priceFilterRange = { min: 0, max: 300 };
  const ratingFilterRange = { min: 0, max: 5 };

  const [priceRange, setPriceRange] = useState(priceFilterRange);
  const [ratingRange, setRatingRange] = useState(ratingFilterRange);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  return (
    <Card className="w-80 md:w-[26rem] h-fit">
      <CardBody className="flex flex-col align-middle text-center">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <PriceFilter
          min={priceFilterRange.min}
          max={priceFilterRange.max}
          onChange={setPriceRange}
        />
        <RatingFilter
          min={ratingFilterRange.min}
          max={ratingFilterRange.max}
          onChange={setRatingRange}
        />
        <TagsFilter selectedTags={selectedTags} onChange={setSelectedTags} />
        <Button
          onPress={() => {
            const filterVals: FiltersType = {
              current_price_min:
                priceRange.min != priceFilterRange.min
                  ? priceRange.min
                  : undefined,
              current_price_max:
                priceRange.max != priceFilterRange.max
                  ? priceRange.max
                  : undefined,
              product_avg_rating_min:
                ratingRange.min != ratingFilterRange.min
                  ? ratingRange.min
                  : undefined,
              product_avg_rating_max:
                ratingRange.max != ratingFilterRange.max
                  ? ratingRange.max
                  : undefined,
              tags: selectedTags.length > 0 ? selectedTags : undefined,
            };
            onFiltersSave(filterVals);
          }}
        >
          Save Filters
        </Button>
      </CardBody>
    </Card>
  );
}
