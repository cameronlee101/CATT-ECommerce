"use client";

import { Button, Card, CardBody } from "@nextui-org/react";
import React, { useState } from "react";
import { PriceFilter } from "./PriceFilter";
import { RatingFilter } from "./RatingFilter";

export function Filters() {
  const minFilteredPrice = 0;
  const maxFilteredPrice = 100;
  const minFilteredRating = 0;
  const maxFilteredRating = 5;

  const [priceRange, setPriceRange] = useState({
    min: minFilteredPrice,
    max: maxFilteredPrice,
  });
  const [reviewRange, setReviewRange] = useState({
    min: minFilteredRating,
    max: maxFilteredRating,
  });

  return (
    <Card className="w-80 h-fit">
      <CardBody className="flex flex-col align-middle text-center">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <PriceFilter min={minFilteredPrice} max={maxFilteredPrice} onChange={setPriceRange} />
        <RatingFilter min={minFilteredRating} max={maxFilteredRating} onChange={setReviewRange} />
        <Button>Save Filters</Button>
      </CardBody>
    </Card>
  );
}
