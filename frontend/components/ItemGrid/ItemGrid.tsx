"use client";

import { Product } from "@/api/product.types";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import ItemCard from "../ItemCard/ItemCard";
import ItemCardSkeleton from "../ItemCardSkeleton/ItemCardSkeleton";

type ItemGridProps = {
	getContents: (filters: string[]) => Promise<Product[]>;
	filters: string[];
};

function ItemGrid({ getContents, filters }: ItemGridProps) {
	const { isLoading, error, data } = useQuery({
		queryKey: ["products", getContents, filters],
		queryFn: () => getContents(filters),
	});

	const [items, setItems] = useState<Product[]>([]);

	useEffect(() => {
		if (data) {
			setItems(data);
		}
	}, [data]);

	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="flex flex-wrap gap-y-8 flex-1 justify-items-center items-center">
			{!(isLoading || error)
				? items.map((item) => (
						<div key={item.productId} className="mx-auto">
							<ItemCard isLoading={isLoading} error={error} product={item} />
						</div>
					))
				: Array.from({ length: 10 }, (_, index) => (
						<div key={index}>
							<ItemCardSkeleton />
						</div>
					))}
		</div>
	);
}

export default ItemGrid;
