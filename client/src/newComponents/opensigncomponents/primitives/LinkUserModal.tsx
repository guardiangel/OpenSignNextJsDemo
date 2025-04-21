import SelectSigners from "@newComponents/opensigncomponents/shared/fields/SelectSigners";
import { useTranslation } from "react-i18next";
import AddContact from "./AddContact";
import ModalUi from "./ModalUi";

const LinkUserModal = (props) => {
  const { t } = useTranslation();
  return (
    <ModalUi
      title={t("add/choose-signer")}
      isOpen={
        props?.isAddSigner ||
        (props?.isAddUser && props?.isAddUser[props?.uniqueId])
      }
      handleClose={props.closePopup}
      reduceWidth={true} 
    >
      <SelectSigners
        details={props.handleAddUser}
        closePopup={props.closePopup}
        signersData={props?.signersData}
        jwttoken={props?.jwttoken}
      />
      <div className="op-divider text-base-content mx-[25%] my-1">
        {t("or")}
      </div>
      <AddContact
        details={props.handleAddUser}
        closePopup={props.closePopup}
        jwttoken={props?.jwttoken}
      />
    </ModalUi>
  );
};

export default LinkUserModal;
