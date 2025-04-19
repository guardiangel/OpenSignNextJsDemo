import { contractDocument } from "@/newComponents/opensigncomponents/constant/Utils";
import HandleError from "@/newComponents/opensigncomponents/primitives/HandleError";
import LoaderWithMsg from "@/newComponents/opensigncomponents/primitives/LoaderWithMsg";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";


function DraftDocument() {
  const { t } = useTranslation();
  const router = useRouter();
  const { docId } = router.query; 
  console.log("draftDocument docId: " , docId);
  const [isLoading, setIsLoading] = useState({
    isLoader: true,
    message: t("loading-mssg")
  });
  useEffect(() => {
    getDocumentDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //get document details
  const getDocumentDetails = async () => {
    //getting document details
    const documentData = await contractDocument(docId,undefined);
    if (documentData && documentData.length > 0) {
      handleDraftDoc(documentData);
    } else if (
      documentData === "Error: Something went wrong!" ||
      (documentData.result && documentData.result.error)
    ) {
      setIsLoading({
        isLoader: false,
        message: "Error: Something went wrong!"
      });
    } else {
      setIsLoading({
        isLoader: false,
        message: "No data found!"
      });
    }
  };

  //check document type and render on signyour self and placeholder route
  const handleDraftDoc = (documentData) => {
    const data = documentData[0];
    const signerExist = data.Signers && data.Signers;
    const isDecline = data.IsDeclined && data.IsDeclined;
    const isPlaceholder = data.Placeholders && data.Placeholders;
    const signedUrl = data.SignedUrl;
    //checking if document has completed and request signature flow
    if (data?.IsCompleted && signerExist?.length > 0) {
      router.push(`/recipientSignPdf/${data.objectId}`);
    }
    //checking if document has completed and signyour-self flow
    else if ((!signerExist && !isPlaceholder) || data?.IsSignyourself) {
      router.push(`/signaturePdf/${data.objectId}`);
    }
    //checking if document has declined by someone
    else if (isDecline) {
      router.push(`/recipientSignPdf/${data.objectId}`);
      //checking draft type document
    } else if (
      signerExist?.length > 0 &&
      isPlaceholder?.length > 0 &&
      !signedUrl
    ) {
      router.push(`/placeHolderSign/${data.objectId}`);
    }
    //Inprogress document
    else if (isPlaceholder?.length > 0 && signedUrl) {
      router.push(`/recipientSignPdf/${data.objectId}`);
    } //placeholder draft document
    else if (
      (signerExist?.length > 0 &&
        (!isPlaceholder || isPlaceholder?.length === 0)) ||
      ((!signerExist || signerExist?.length === 0) && isPlaceholder?.length > 0)
    ) {
      router.push(`/placeHolderSign/${data.objectId}`);
    }
  };

  return (
    <div>
      {isLoading.isLoader ? (
        <LoaderWithMsg isLoading={isLoading} />
      ) : (
        <HandleError handleError={isLoading.message} />
      )}
    </div>
  );
}

export default DraftDocument;
