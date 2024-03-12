import { ShoppingCartEntry } from "@/api/product.types";
import { Radio, RadioGroup } from "@nextui-org/react";
import { useState } from "react";

type PurchaseAcquisitionProps = {
	data: undefined | ShoppingCartEntry[];
};

function PurchaseAcquisition({ data }: PurchaseAcquisitionProps) {
	const [selectedOption, setSelectedOption] = useState("delivery");

	return (
		<div>
			<h3 className="text-xl flex justify-center mb-2">
				Choose how to get your purchase:
			</h3>
			<div className="flex justify-center mb-2">
				<RadioGroup onValueChange={setSelectedOption} defaultValue="delivery">
					<Radio value="delivery">Delivery</Radio>
					<Radio value="pickup">Pickup</Radio>
				</RadioGroup>
			</div>
			{selectedOption == "delivery" && (
				<div>
					<p>Shipping Details:</p>
				</div>
			)}
			{selectedOption == "pickup" && (
				<div>
					<p>Addresses of warehouses to pick items:</p>
				</div>
			)}
		</div>
	);
}

export default PurchaseAcquisition;
