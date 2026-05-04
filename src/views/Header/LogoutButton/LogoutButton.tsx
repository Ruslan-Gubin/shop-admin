"use client";
import { useState, useTransition } from "react";
import { ExitSvg } from "@/shared/svg/ExitSvg";
import { Modal } from "@/shared/ui/modal/Modal";
import { ModalContent } from "@/shared/ui/modal/modal-content/ModalContent";
import { ModalFooter } from "@/shared/ui/modal/modal-footer/ModalFooter";
import { ModalHeader } from "@/shared/ui/modal/modal-header/ModalHeader";

type Props = {
  logoutAction: () => Promise<{ status: string; message: string }>;
};

export const LogoutButton = (props: Props) => {
  const [openLogoutModal, setOpenLogoutModal] = useState<boolean>(false);
  const [disabled, transition] = useTransition();

  const handleLogout = () => {
    transition(() => {
      props.logoutAction().then((response) => {
        if (response.status === "success") {
          setOpenLogoutModal(false);
        }
      });
    });
  };

  return (
    <>
      <Modal active={openLogoutModal} handleCloseAction={() => setOpenLogoutModal(false)}>
        <ModalContent>
          <ModalHeader
            title="Вы действительно хотите выйти?"
            onClose={() => setOpenLogoutModal(false)}
          />
          <ModalFooter
            cancelAction={{ action: () => setOpenLogoutModal(false) }}
            submitAction={{ action: handleLogout, disabled }}
          />
        </ModalContent>
      </Modal>
      <button type="button" onClick={() => setOpenLogoutModal(true)}>
        <ExitSvg />
      </button>
    </>
  );
};
