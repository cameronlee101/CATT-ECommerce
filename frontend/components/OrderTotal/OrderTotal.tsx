import { ShoppingCartEntry } from "@/api/product.types";
import { useEffect, useState } from "react";

type OrderTotalProps = {
	data: undefined | ShoppingCartEntry[];
};

function OrderTotal({ data }: OrderTotalProps) {
	const taxPercentage = 0.11;

	const [totalSubprice, setTotalSubprice] = useState(-1);
	const [totalPrice, setTotalPrice] = useState(-1);

	useEffect(() => {
		if (data) {
			let subtotal = 0;
			for (let item of data) {
				subtotal += item.quantity * item.product.price;
			}
			setTotalSubprice(Number(subtotal.toFixed(2)));
			setTotalPrice(Number((subtotal * (1 + taxPercentage)).toFixed(2)));
		}
	}, [data]);

	return (
		<div>
			<h3 className="text-xl flex justify-center mb-2">Order Total:</h3>
			<div>
				{data?.map((item) => (
					<div key={item.product.productId} className="flex flex-row gap-2">
						<p>${item.product.price.toFixed(2)}</p>
						<p>x</p>
						<p>{item.quantity}</p>
						<p>= ${(item.product.price * item.quantity).toFixed(2)}</p>
					</div>
				))}
				<p>Total before taxes: ${totalSubprice.toFixed(2)}</p>
			</div>
			<div className="mt-4">
				<p>
					Tax (%{taxPercentage * 100}): $
					{(totalSubprice * taxPercentage).toFixed(2)}
				</p>
				<p>Total after tax: ${totalPrice}</p>
			</div>
		</div>
	);
}

export default OrderTotal;
