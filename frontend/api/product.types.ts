export type Product = {
	product_id: number;
	product_name: string;
	base_price: string;
	price: number;
	description: string;
};

export type ShoppingCartEntry = {
	product: Product;
	quantity: number;
};

export type WishlistEntry = {
	product: Product;
	quantity: number;
};