"use client";

import { Modal } from "@/components/Modal";
import { LifeWishList100View } from "@/components/LifeWishList100View";
import { LIFE_WISH_LIST_100_LABEL } from "@/lib/life-wish-list-100";

type LifeWishList100ModalProps = {
  onClose: () => void;
};

export function LifeWishList100Modal({ onClose }: LifeWishList100ModalProps) {
  return (
    <Modal title={LIFE_WISH_LIST_100_LABEL} onClose={onClose} plan>
      <LifeWishList100View />
    </Modal>
  );
}
