import { Product } from "./product.types";

// mock entries
const generateProduct = (productId: number): Product => ({
	productId: productId,
	name: "Wooden Stool",
	imgSrc: "/images/wood-stool.jpg",
	price: 15.2,
	description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
});

const numberOfProducts = 8;
var products: Product[] = [];

for (let i = 1; i <= numberOfProducts; i++) {
	products.push(generateProduct(i));
}

// gets the current user's wishlist
export async function getWishlistProducts(): Promise<Product[]> {
	return products;
}

// adds a product to the current user's wishlist
export async function addToWishlist(productId: number, quantity: number) {}

// removes a products from the current user's wishlist
export async function removeFromWishlist(productId: number) {
	products = products.filter((item) => {
		return item.productId != productId;
	});
}
