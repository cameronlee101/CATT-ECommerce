import { Product } from "./product.types";
import { axios } from "./axios";

// given a product's id, returns all that product's info
export async function getProduct(productId: number) {
	const mock: Product = {
		productId: productId,
		name: "Wooden Stool",
		imgSrc: "/images/wood-stool.jpg",
		price: 15.2,
		description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
	};
	return mock;
}

// returns a number of the newest products
export async function getNewProducts(limit: number): Promise<Product[]> {
	const generateProduct = (productId: number): Product => ({
		productId: productId,
		name: "Wooden Stool",
		imgSrc: "/images/wood-stool.jpg",
		price: 15.2,
		description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
	});

	const numberOfProducts = 20; // Define the number of products needed
	const products: Product[] = [];

	for (let i = 1; i <= numberOfProducts; i++) {
		products.push(generateProduct(i));
	}

	return products;
}

// returns a number of products that are on sale
export async function getSaleProducts(limit?: number): Promise<Product[]> {
	const generateProduct = (productId: number): Product => ({
		productId: productId,
		name: "Wooden Stool",
		imgSrc: "/images/wood-stool.jpg",
		price: 15.2,
		description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
	});

	const numberOfProducts = 20; // Define the number of products needed
	const products: Product[] = [];

	for (let i = 1; i <= numberOfProducts; i++) {
		products.push(generateProduct(i));
	}

	return products;
}

// returns basic info on all the products that fulfill a set of filters
export async function getCategoryProducts(
	filters: string[]
): Promise<Product[]> {
	const generateProduct = (productId: number): Product => ({
		productId: productId,
		name: "Wooden Stool",
		imgSrc: "/images/wood-stool.jpg",
		price: 15.2,
		description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
	});

	const numberOfProducts = 23; // Define the number of products needed
	const products: Product[] = [];

	for (let i = 1; i <= numberOfProducts; i++) {
		products.push(generateProduct(i));
	}

	return products;
}
