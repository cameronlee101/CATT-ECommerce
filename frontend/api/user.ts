import { axios } from "./axios";
import { UserAddress, UserTypes, isUserType } from "./user.types";

export async function createNewUser(uemail: string, utype: UserTypes) {
	try {
		await axios.post("/???", {
			data: {
				uemail: uemail,
				utype: utype
			}
		})
	}
	catch (error) {
		console.error(error)
	}
}

export async function getUserType(uemail: string): Promise<UserTypes | undefined> {
	return UserTypes.Vendor;

	// backend call
	try {
		let response = await axios.get("/getUser", {
			data: {
				uemail: uemail
			}
		})
	
		if (isUserType(response.data)) {
			return response.data
		}
		else {
			return undefined
		}
	}
	catch (error) {
		console.error(error)
	}
}

export async function updateUserType(uemail: string, utype: UserTypes) {
	try {
		await axios.patch("/???", {
			data: {
				uemail: uemail,
				utype: utype
			}
		})
	}
	catch (error) {
		console.error(error)
	}
}

export async function updateUserAddress(uemail: string, address: UserAddress) {
	try {
		await axios.patch("/???", {
			data: {
				uemail: uemail,
				address: address,
			}
		})
	}
	catch (error) {
		console.error(error)
	}
}