import { axios } from "./axios";
import { UserTypes, isUserType } from "./user.type";

export async function getUserType(uemail: string): Promise<UserTypes | null> {
	// let response = await axios.get("/getUser", {
	// 	data: {
	// 		uemail: uemail
	// 	}
	// })

	// if (isUserType(response.data)) {
	// 	return response.data
	// }
	// else {
	// 	return null
	// }

	return UserTypes.Vendor;
}
