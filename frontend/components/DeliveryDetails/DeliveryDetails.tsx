import { ShoppingCartEntry } from "@/api/product.types";
import { UserAddress } from "@/api/user.type";
import {
	Button,
	Input,
	Radio,
	RadioGroup,
	Select,
	SelectItem,
	select,
} from "@nextui-org/react";
import { useState } from "react";

type DeliveryDetailsProps = {
	data: undefined | ShoppingCartEntry[];
	onInfoSubmit: (
		acquisitionMethod: "delivery" | "pickup",
		deliveryDetails?: UserAddress
	) => void;
	onInfoEdit: () => void;
};

const provinces = [
	"BC",
	"AB",
	"SK",
	"MB",
	"QC",
	"ON",
	"NL",
	"NB",
	"NS",
	"PEI",
	"YT",
	"NT",
	"NU",
];

// TODO: figure out a better way to manage the form and get the values when submitting
function DeliveryDetails({
	data,
	onInfoSubmit,
	onInfoEdit,
}: DeliveryDetailsProps) {
	const [selectedOption, setSelectedOption] = useState("delivery");
	const [errorMessage, setErrorMessage] = useState("");
	const [formSubmitted, setFormSubmitted] = useState(false);

	const [deliveryFormData, setDeliveryFormData] = useState<UserAddress>({
		street_address: "",
		postal_code: "",
		city: "",
		province: "",
	});

	const handleInputChange = (
		event:
			| React.ChangeEvent<HTMLInputElement>
			| React.ChangeEvent<HTMLSelectElement>
	) => {
		const { name, value } = event.target;

		setDeliveryFormData({ ...deliveryFormData, [name]: value });
	};

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();

		if (selectedOption == "pickup") {
			onInfoSubmit("pickup");
			setFormSubmitted(true);
		} else {
			let validForm = true;
			Object.values(deliveryFormData).forEach((value, index) => {
				if (value === "") {
					validForm = false;
					setErrorMessage("Error: one or more fields are empty");
				}
			});

			if (validForm) {
				onInfoSubmit("delivery", deliveryFormData);
				setFormSubmitted(true);
				setErrorMessage("");
			}
		}
	};

	return !formSubmitted ? (
		<div>
			<h3 className="text-xl flex justify-center mb-2">
				Choose how to receive your purchase:
			</h3>
			<div className="flex justify-center mb-2">
				<RadioGroup
					onValueChange={setSelectedOption}
					defaultValue={selectedOption}
				>
					<Radio value="delivery">Delivery</Radio>
					<Radio value="pickup">Pickup</Radio>
				</RadioGroup>
			</div>
			{selectedOption == "delivery" && (
				<div>
					<p className="mb-1">Shipping Details:</p>
					<form onSubmit={handleSubmit} className="flex flex-col">
						<Input
							className="mb-1"
							type="text"
							label="Street Address"
							name="street_address"
							placeholder="Enter your street address"
							isRequired
							onChange={handleInputChange}
							defaultValue={deliveryFormData.street_address}
						/>
						<Input
							className="mb-1"
							type="text"
							label="Postal Code"
							name="postal_code"
							placeholder="Enter your postal code"
							isRequired
							onChange={handleInputChange}
							defaultValue={deliveryFormData.postal_code}
						/>
						<Input
							className="mb-1"
							type="city"
							label="City"
							name="city"
							placeholder="Enter your city"
							isRequired
							onChange={handleInputChange}
							defaultValue={deliveryFormData.city}
						/>
						<Select
							label="Select a province/territory"
							name="province"
							className="max-w-xs mb-1"
							isRequired
							onChange={handleInputChange}
							defaultSelectedKeys={[deliveryFormData.province]}
						>
							{provinces.map((province) => (
								<SelectItem key={province} value={province}>
									{province}
								</SelectItem>
							))}
						</Select>
						<p className="text-red-600">{errorMessage}</p>
						<Button
							type="submit"
							color="primary"
							className="w-fit self-center mt-3"
						>
							Save
						</Button>
					</form>
				</div>
			)}
			{selectedOption == "pickup" && (
				<div>
					<p>Addresses of warehouses to pick items:</p>
					<p>TODO</p>
					<Button
						type="submit"
						color="primary"
						className="w-fit self-center mt-3"
						onClick={() => {
							setFormSubmitted(true);
							onInfoSubmit("pickup");
						}}
					>
						Save
					</Button>
				</div>
			)}
		</div>
	) : (
		<div>
			{selectedOption == "delivery" && (
				<div>
					<p className="mb-1">Shipping Details:</p>
					<p>Address: {deliveryFormData.street_address}</p>
					<p>Postal Code: {deliveryFormData.postal_code}</p>
					<p>City: {deliveryFormData.city}</p>
					<p>Province: {deliveryFormData.province}</p>
					<Button
						type="submit"
						className="w-fit self-center mt-3"
						onClick={() => {
							setFormSubmitted(false);
							onInfoEdit();
						}}
					>
						Edit
					</Button>
				</div>
			)}

			{selectedOption == "pickup" && (
				<div>
					<p>Addresses of warehouses to pick items:</p>
					<p>TODO</p>
					<Button
						type="submit"
						className="w-fit self-center mt-3"
						onClick={() => {
							setFormSubmitted(false);
							onInfoEdit();
						}}
					>
						Edit
					</Button>
				</div>
			)}
		</div>
	);
}

export default DeliveryDetails;
