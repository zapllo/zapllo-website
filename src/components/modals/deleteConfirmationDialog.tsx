"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon, CrossCircledIcon } from "@radix-ui/react-icons";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Delete",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
}) => {
  console.log("isOpen in Dialog:", isOpen); // Log to confirm the isOpen prop is being passed correctly
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0  bg-black/50 opacity- z-[10]" />
        <Dialog.Content className="fixed z-[100] inset-0 flex items-center justify-center">
          <div className="bg-[#0b0d29] overflow-y-scroll scrollbar-hide h-fit max-h-[600px]  shadow-lg w-full   max-w-md  rounded-lg">
            <div className="flex border-b py-2  w-full justify-between ">
              <Dialog.Title className="text-md   px-6 py-2 font-medium">
                {title}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className=" px-6 py-2">
                  <CrossCircledIcon className="scale-150 mt-1 hover:bg-[#ffffff] rounded-full hover:text-[#815BF5]" />
                </button>
              </Dialog.Close>
            </div>
            <Dialog.Description className="text-xs mt-2 px-6 text-[#787CA5]">
              {description}
            </Dialog.Description>
            <div className="mr-6 mb-4  mt-4 flex justify-end space-x-2">
              <button
                className="px-4 py-2 text-sm border  rounded-md"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm bg-red-600 rounded-md"
                onClick={onConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default DeleteConfirmationDialog;
