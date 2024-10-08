"use client";

import React, { useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { getProduct, deleteProductListing } from "@/axios/product";

type DeleteModalProps = {
  open: boolean;
  onDeleteClose: () => void;
  productId: number;
};

export function DeleteModal({
  open,
  onDeleteClose,
  productId,
}: DeleteModalProps) {
  //query the product
  const { isLoading, error, data } = useQuery({
    queryKey: ["Product", productId],
    queryFn: () => getProduct(productId),
  });

  //standard modal from nextui documentation/wishlistModal
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    if (open) {
      onOpen();
    }
  }, [open, onOpen]);

  useEffect(() => {
    if (!isOpen) {
      onDeleteClose();
    }
  }, [isOpen, onDeleteClose]);

  //sends the request to delete
  const handleSubmit = async () => {
    await deleteProductListing(productId);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <p>{data?.product_name}</p>
            </ModalHeader>
            <ModalBody className="overflow-y-auto">
              <p className="text-red-500">
                do you want to delete product {data?.product_name}
              </p>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="danger"
                variant="light"
                onPress={() => {
                  handleSubmit().then(onClose);
                }}
              >
                Delete
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
