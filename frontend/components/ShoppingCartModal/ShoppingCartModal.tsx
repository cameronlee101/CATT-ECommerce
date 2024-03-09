"use client";

import React from "react";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	useDisclosure,
	Badge,
} from "@nextui-org/react";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

function ShoppingCartModal() {
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	return (
		<>
			<div onClick={onOpen} className="cursor-pointer pt-3">
				<Badge color="danger" content={8} shape="circle">
					<ShoppingCartIcon />
				</Badge>
			</div>
			<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader className="flex flex-col gap-1">
								Shopping Cart
							</ModalHeader>
							<ModalBody>
								<div className="border border-blue-500 h-24">
									Shopping Cart Item
								</div>
								<div className="border border-blue-500 h-24">
									Shopping Cart Item
								</div>
								<div className="border border-blue-500 h-24">
									Shopping Cart Item
								</div>
							</ModalBody>
							<ModalFooter>
								<Button color="default" variant="light" onPress={onClose}>
									Close
								</Button>
								<Button color="primary" onPress={onClose}>
									Check Out
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</>
	);
}

export default ShoppingCartModal;
