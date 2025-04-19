import {
  checkIsSubscribed,
  contactBook,
  contractDocument,
  contractUsers,
  convertPdfArrayBuffer,
  getContainerScale,
  getDefaultSignature,
  XParseApplicationId
} from "@/newComponents/opensigncomponents/constant/Utils";
import RenderAllPdfPage from "@/newComponents/opensigncomponents/pdf/RenderAllPdfPage";
import RenderPdf from "@/newComponents/opensigncomponents/pdf/RenderPdf";
import HandleError from "@/newComponents/opensigncomponents/primitives/HandleError";
import LoaderWithMsg from "@/newComponents/opensigncomponents/primitives/LoaderWithMsg";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { DndProvider, useDrag } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useTranslation } from "react-i18next";
import { pdfjs } from "react-pdf";
import { useSelector } from "react-redux";

if (typeof window !== 'undefined') {
  //Download 3.6.172, keep the same as the definition in package.json, don't upgrade pdfjs-dist and react-pdf
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.6.172/pdf.worker.min.js`;
}
interface ContainerSize {
  width: number;
  height: number;
}
function SignYourSelf() {
  const { t } = useTranslation();
  const [pdfDetails, setPdfDetails] = useState([]);
  const [isSignPad, setIsSignPad] = useState(false);
  const [allPages, setAllPages] = useState(null);
  const [pdfUrl, setPdfUrl] = useState();
  const [xyPostion, setXyPostion] = useState([]);
  const [defaultSignImg, setDefaultSignImg] = useState();
  const numPages = 1;
  const [pageNumber, setPageNumber] = useState(1);
  const [image, setImage] = useState(null);
  const [isImageSelect, setIsImageSelect] = useState(false);
  const [signature, setSignature] = useState();
  const [isStamp, setIsStamp] = useState(false);
  const [isEmail, setIsEmail] = useState(false);
  const [signBtnPosition, setSignBtnPosition] = useState([]);
  const [xySignature, setXYSignature] = useState({});
  const signRef = useRef(null);
  const dragRef = useRef(null);
  const [dragKey, setDragKey] = useState();
  const [fontSize, setFontSize] = useState();
  const [fontColor, setFontColor] = useState();
  const [signKey, setSignKey] = useState();
  const [imgWH, setImgWH] = useState({});
  const [pdfNewWidth, setPdfNewWidth] = useState(0);
  const [pdfOriginalWH, setPdfOriginalWH] = useState([]);
  const [successEmail, setSuccessEmail] = useState(false);
  const imageRef = useRef(null);
  const [myInitial, setMyInitial] = useState("");
  const [isInitial, setIsInitial] = useState(false);
  const [isUiLoading, setIsUiLoading] = useState(false);
  const [validateAlert, setValidateAlert] = useState(false);
  const [isLoading, setIsLoading] = useState({
    isLoad: true,
    message: t("loading-mssg")
  });
  const [handleError, setHandleError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [signTour, setSignTour] = useState(true);
  const router = useRouter();
  let { docId } = router.query; 
  console.log("SignyourselfPdf docId first:",docId);

  const [id, setId] = useState(null);

  // useEffect(() => {
  //   if (router.isReady) {
  //     setId(router.query.id);
  //   }
  // }, [router.isReady, router.query.id]);

  // console.log("SignyourselfPdf id second:",id);
  

  const [checkTourStatus, setCheckTourStatus] = useState(false);
  const [signerUserId, setSignerUserId] = useState();
  const [tourStatus, setTourStatus] = useState([]);
  const [contractName, setContractName] = useState("");
  const [containerWH, setContainerWH] =  useState<ContainerSize>({ width: 0, height: 0 });
  const [isPageCopy, setIsPageCopy] = useState(false);
  const [selectWidgetId, setSelectWidgetId] = useState("");
  const [otpLoader, setOtpLoader] = useState(false);
  const [showAlreadySignDoc, setShowAlreadySignDoc] = useState({
    status: false
  });
  const [isTextSetting, setIsTextSetting] = useState(false);
  const [currWidgetsDetails, setCurrWidgetsDetails] = useState({});
  const [isCheckbox, setIsCheckbox] = useState(false);
  const [widgetType, setWidgetType] = useState("");
  const [pdfLoad, setPdfLoad] = useState(false);
  const [isAlert, setIsAlert] = useState({ isShow: false, alertMessage: "" });
  const [isDontShow, setIsDontShow] = useState(false);
  const [extUserId, setExtUserId] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCelebration, setIsCelebration] = useState(false);
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState("");
  const [activeMailAdapter, setActiveMailAdapter] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [isVerifyModal, setIsVerifyModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [zoomPercent, setZoomPercent] = useState(0);
  const isHeader = useSelector((state) => state.showHeader);
  const [scale, setScale] = useState(1);
  const [pdfRotateBase64, setPdfRotatese64] = useState("");
  const [isRotate, setIsRotate] = useState({ status: false, degree: 0 });
  const [isSubscribe, setIsSubscribe] = useState({ plan: "", isValid: true });
  const [isDownloadModal, setIsDownloadModal] = useState(false);
  const [isResize, setIsResize] = useState(false);
  const divRef = useRef<HTMLDivElement>();
  const nodeRef = useRef<HTMLDivElement>(null);

  const pdfRef = useRef<HTMLDivElement>(null);
  const [{ isDragSign }, dragSignature] = useDrag({
    type: "BOX",
    item: { id: 1, text: "signature" },
    collect: (monitor) => ({ isDragSign: !!monitor.isDragging() })
  });
  const [{ isDragStamp }, dragStamp] = useDrag({
    type: "BOX",
    item: { id: 2, text: "stamp" },
    collect: (monitor) => ({ isDragStamp: !!monitor.isDragging() })
  });

  const index = xyPostion?.findIndex((object) => {
    return object.pageNumber === pageNumber;
  });
  const rowLevel =
    localStorage.getItem("rowlevel") &&
    JSON.parse(localStorage.getItem("rowlevel"));
  const signObjId =
    rowLevel && rowLevel?.id
      ? rowLevel.id
      : rowLevel?.objectId && rowLevel.objectId;

  const documentId = docId ? docId : signObjId && signObjId;

  const senderUser =
    localStorage.getItem(
      `Parse/${XParseApplicationId}/currentUser`
    ) &&
    localStorage.getItem(
      `Parse/${XParseApplicationId}/currentUser`
    );

  const jsonSender = JSON.parse(senderUser);

  useEffect(() => {
    setIsLoading({ isLoad: true, message: t("loading-mssg") }); // Start loading
    if(documentId) {
      getDocumentDetails(true,documentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  useEffect(() => {
    console.log("divRef.current:", divRef.current);
    const updateSize = () => {
      if(divRef.current) {
        const pdfWidth = divRef.current.offsetWidth;
        console.log("divRef.current.offsetWidth:", divRef.current.offsetWidth);
        setPdfNewWidth(pdfWidth);
        setContainerWH({
          width: divRef.current.offsetWidth,
          height: divRef.current.offsetHeight,
        });
        setScale(1);
        setZoomPercent(0);
      }
    };
    // Use setTimeout to wait for the transition to complete
    const timer = setTimeout(updateSize, 100); // match the transition duration
     return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [divRef.current]);

  //function for get document details for perticular signer with signer'object id
  const getDocumentDetails = async (showComplete,documentId) => {
    console.log("getDocumentDetails documentId is :", documentId);
    try {
      const subscribe = await checkIsSubscribed();
      setIsSubscribe(subscribe);
      console.log("[docId].tsx getDocumentDetails subscribe:",subscribe);
    } catch (err:any) {
      console.log("getDocumentDetails err in fetch sub", err);
    }
    try {
      let isCompleted;
      //getting document details
      const documentData = await contractDocument(documentId,null);

      console.log("getDocumentDetails documentData:",documentData);

      if (documentData && documentData.length > 0) {
        setPdfDetails(documentData);
        setExtUserId(documentData[0]?.ExtUserPtr?.objectId);
        const placeholders =
          documentData[0]?.Placeholders?.length > 0
            ? documentData[0]?.Placeholders
            : [];
        setXyPostion(placeholders);
        const url = documentData[0] && documentData[0]?.URL;

        console.log("getDocumentDetails url:",url);

        if (url) {
          //convert document url in array buffer format to use embed widgets in pdf using pdf-lib
          const arrayBuffer = await convertPdfArrayBuffer(url);
          if (arrayBuffer === "Error") {
            setHandleError(t("something-went-wrong-mssg"));
          } else {
            setPdfArrayBuffer(arrayBuffer);
          }
        } else {
          setHandleError(t("something-went-wrong-mssg"));
        }
        isCompleted = documentData?.[0]?.IsCompleted;
        if (isCompleted) {
          setIsCelebration(true);
          setTimeout(() => setIsCelebration(false), 5000);
          setIsCompleted(true);
          setPdfUrl(documentData[0].SignedUrl);
          if (showComplete) {
            setShowAlreadySignDoc({
              status: true,
              mssg: t("document-signed-alert")
            });
          } else {
            setIsUiLoading(false);
            setIsSignPad(false);
            setIsEmail(true);
            setXyPostion([]);
            setSignBtnPosition([]);
          }
        }
      } else if (
        documentData === "Error: Something went wrong!" ||
        (documentData.result && documentData.result.error)
      ) {
        setHandleError(t("something-went-wrong-mssg"));
        setIsLoading({ isLoad: false });
      } else {
        setHandleError(t("no-data-avaliable"));
        setIsLoading({ isLoad: false });
      }
      //function to get default signatur eof current user from `contracts_Signature` class
      const defaultSignRes = await getDefaultSignature(jsonSender.objectId);
      if (defaultSignRes?.status === "success") {
        setDefaultSignImg(defaultSignRes?.res?.defaultSignature);
        setMyInitial(defaultSignRes?.res?.defaultInitial);
      } else if (defaultSignRes?.status === "error") {
        setHandleError("Error: Something went wrong!");
        setIsLoading({ isLoad: false });
      }
      const contractUsersRes = await contractUsers();
      if (contractUsersRes === "Error: Something went wrong!") {
        setHandleError(t("something-went-wrong-mssg"));
        setIsLoading({ isLoad: false });
      } else if (contractUsersRes[0] && contractUsersRes.length > 0) {
        setActiveMailAdapter(contractUsersRes[0]?.active_mail_adapter);
        setContractName("_Users");
        setSignerUserId(contractUsersRes[0].objectId);

        const tourstatuss =
          contractUsersRes[0].TourStatus && contractUsersRes[0].TourStatus;

        if (tourstatuss && tourstatuss.length > 0 && !isCompleted) {
          setTourStatus(tourstatuss);
          const checkTourRecipients = tourstatuss.filter(
            (data) => data.signyourself
          );
          if (checkTourRecipients && checkTourRecipients.length > 0) {
            setCheckTourStatus(checkTourRecipients[0].signyourself);
          }
        } else {
          setCheckTourStatus(true);
        }
        const loadObj = {
          isLoad: false
        };
        setIsLoading(loadObj);
      } else if (contractUsersRes.length === 0) {
        const contractContactBook = await contactBook(jsonSender.objectId);
        if (contractContactBook && contractContactBook.length > 0) {
          setContractName("_Contactbook");
          setSignerUserId(contractContactBook[0].objectId);
          const tourstatuss =
            contractContactBook[0].TourStatus &&
            contractContactBook[0].TourStatus;

          if (tourstatuss && tourstatuss.length > 0 && !isCompleted) {
            setTourStatus(tourstatuss);
            const checkTourRecipients = tourstatuss.filter(
              (data) => data.signyourself
            );
            if (checkTourRecipients && checkTourRecipients.length > 0) {
              setCheckTourStatus(checkTourRecipients[0].signyourself);
            }
          } else {
            setCheckTourStatus(true);
          }
        } else {
          setHandleError(t("no-data-avaliable"));
        }
        const loadObj = {
          isLoad: false
        };
        setIsLoading(loadObj);
      }
    } catch (err:any) {
      console.log("Error: error in getDocumentDetails", err);
      setHandleError("Error: Something went wrong!");
      setIsLoading({
        isLoad: false
      });
    }
  };

  //function for save x and y position and show signature  tab on that position
  const handleTabDrag = (key) => {
    setDragKey(key);
    setIsDragging(true);
  };
  //function for set and update x and y postion after drag and drop signature tab
  const handleStop = (event, dragElement) => {
    setFontSize();
    setFontColor();
    if (!isResize && isDragging && dragElement) {
      event.preventDefault();
      const containerScale = getContainerScale(
        pdfOriginalWH,
        pageNumber,
        containerWH
      );
      if (dragKey >= 0) {
        const filterDropPos = xyPostion?.filter(
          (data) => data.pageNumber === pageNumber
        );
        if (filterDropPos?.length > 0) {
          const getXYdata = xyPostion[index].pos;
          const getPosData = getXYdata;
          const addSign = getPosData.map((url) => {
            if (url.key === dragKey) {
              return {
                ...url,
                xPosition: dragElement.x / (containerScale * scale),
                yPosition: dragElement.y / (containerScale * scale)
              };
            }
            return url;
          });

          const newUpdateUrl = xyPostion.map((obj, ind) => {
            if (ind === index) {
              return { ...obj, pos: addSign };
            }
            return obj;
          });
          setXyPostion(newUpdateUrl);
        }
      }
    }
    setTimeout(() => {
      setIsDragging(false);
    }, 200);
  };
  //function for get pdf page details
  const pageDetails = async (pdf) => {
    let pdfWHObj = [];
    const totalPages = pdf?.numPages;
    for (let index = 0; index < totalPages; index++) {
      const getPage = await pdf.getPage(index + 1);
      const scale = 1;
      const { width, height } = getPage.getViewport({ scale });
      pdfWHObj.push({ pageNumber: index + 1, width, height });
    }
    setPdfOriginalWH(pdfWHObj);
    setPdfLoad(true);
  };

  const handleTextSettingModal = (value) => {
    setIsTextSetting(value);
  };
 
  return (
    <DndProvider backend={HTML5Backend}>
      {isLoading.isLoad ? (
        <LoaderWithMsg isLoading={isLoading} />
      ) : handleError ? (
        <HandleError handleError={handleError} />
      ) : (
        <div>
          
          <div className="relative op-card overflow-hidden flex flex-col md:flex-row justify-between bg-base-300">
            {/* this component used to render all pdf pages in left side */}
            <RenderAllPdfPage
              signPdfUrl={
                pdfDetails[0] && (pdfDetails[0].SignedUrl || pdfDetails[0].URL)
              }
              allPages={allPages}
              setAllPages={setAllPages}
              setPageNumber={setPageNumber}
              setSignBtnPosition={setSignBtnPosition}
              pageNumber={pageNumber}
              containerWH={containerWH}
              pdfRotateBase64={pdfRotateBase64}
            />
             <div className=" w-full md:w-[57%] flex mr-4">
              <div className="w-full md:w-[95%]">
                <div ref={divRef} data-tut="reactourSecond" className="h-full">
                  {containerWH?.width>0 && containerWH?.height>0 && (
                    <RenderPdf
                      pageNumber={pageNumber}
                      pdfOriginalWH={pdfOriginalWH}
                      pdfNewWidth={pdfNewWidth}
                      successEmail={successEmail}
                      nodeRef={nodeRef}
                      handleTabDrag={handleTabDrag}
                      handleStop={handleStop}
                      isDragging={isDragging}
                      setIsSignPad={setIsSignPad}
                      setIsStamp={setIsStamp}
                      setSignKey={setSignKey}
                      pdfDetails={pdfDetails}
                      setIsDragging={setIsDragging}
                      xyPostion={xyPostion}
                      pdfRef={pdfRef}
                      pdfUrl={pdfUrl}
                      numPages={numPages}
                      pageDetails={pageDetails}
                      pdfLoad={pdfLoad}
                      setPdfLoad={setPdfLoad}
                      setXyPostion={setXyPostion}
                      index={index}
                      containerWH={containerWH}
                      setIsPageCopy={setIsPageCopy}
                      setIsInitial={setIsInitial}
                      setWidgetType={setWidgetType}
                      setSelectWidgetId={setSelectWidgetId}
                      selectWidgetId={selectWidgetId}
                      setIsCheckbox={setIsCheckbox}
                      setCurrWidgetsDetails={setCurrWidgetsDetails}
                      setValidateAlert={setValidateAlert}
                      handleTextSettingModal={handleTextSettingModal}
                      setScale={setScale}
                      scale={scale}
                      pdfRotateBase64={pdfRotateBase64}
                      fontSize={fontSize}
                      setFontSize={setFontSize}
                      fontColor={fontColor}
                      setFontColor={setFontColor}
                      isResize={isResize}
                      setIsResize={setIsResize}
                    />
                   )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DndProvider>
  );
}

export default SignYourSelf;
