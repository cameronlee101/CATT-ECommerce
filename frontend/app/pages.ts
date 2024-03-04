export enum Pages {
	Electronics = "Electronics",
	Clothing = "Clothing",
	Kitchen = "Kitchen",
	LivingRoom = "Living Room",
}

export function getPageEnumVal(uri: string): Pages | undefined {
	const str = decodeURI(uri);
	return Object.values(Pages).find((item) => {
		if (item == str) {
			return item;
		}
	});
}
