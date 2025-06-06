import {
    AVATAR_URL,
    fileAdapterId_common,
    handleToPrint,
    OpenSignServerURL,
    XParseApplicationId,
} from '@newComponents/opensigncomponents/constant/Utils';
import {
    emailRegex,
    themeColor,
} from '@newComponents/opensigncomponents/constant/const';
import Loader from '@newComponents/opensigncomponents/primitives/Loader';
import ModalUi from '@newComponents/opensigncomponents/primitives/ModalUi';
import axios from 'axios';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function EmailComponent({
    isEmail,
    pdfUrl,
    setIsEmail,
    setSuccessEmail,
    pdfDetails,
    sender,
    setIsAlert,
    extUserId,
    activeMailAdapter,
    setIsDownloadModal,
}) {
    const { t } = useTranslation();
    const [emailList, setEmailList] = useState<any>([]);
    const [emailValue, setEmailValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailErr, setEmailErr] = useState(false);
    const [isDownloading, setIsDownloading] = useState('');
    const isAndroid = /Android/i.test(navigator.userAgent);
    //function for send email
    const sendEmail = async () => {
        const pdfName = pdfDetails[0]?.Name;
        setIsLoading(true);
        let sendMail;
        const docId = pdfDetails?.[0]?.objectId || '';
        const FileAdapterId = pdfDetails?.[0]?.FileAdapterId
            ? pdfDetails?.[0]?.FileAdapterId
            : fileAdapterId_common;
        let presignedUrl = pdfUrl;
        try {
            const axiosRes = await axios.post(
                `${OpenSignServerURL}/functions/getsignedurl`,
                { url: pdfUrl, docId: docId, fileAdapterId: FileAdapterId },
                {
                    headers: {
                        'content-type': 'Application/json',
                        'X-Parse-Application-Id': XParseApplicationId,
                        'X-Parse-Session-Token':
                            localStorage.getItem('accesstoken'),
                    },
                }
            );
            presignedUrl = axiosRes.data.result;
        } catch (err: any) {
            console.log('err in getsignedurl', err);
        }
        for (let i = 0; i < emailList.length; i++) {
            try {
                const imgPng = AVATAR_URL;

                let url = `${OpenSignServerURL}/functions/sendmailv3`;
                const headers = {
                    'Content-Type': 'application/json',
                    'X-Parse-Application-Id': XParseApplicationId,
                    sessionToken: localStorage.getItem('accesstoken'),
                };
                const openSignUrl = 'https://EducationCa.com';
                const themeBGcolor = themeColor;
                let params = {
                    mailProvider: activeMailAdapter,
                    extUserId: extUserId,
                    pdfName: pdfName,
                    url: presignedUrl,
                    recipient: emailList[i],
                    subject: `${sender.name} has signed the doc - ${pdfName}`,
                    from: sender.email,
                    html:
                        "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body>  <div style='background-color:#f5f5f5;padding:20px'>    <div style='box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;background-color:white;'> <div><img src=" +
                        imgPng +
                        "  height='50' style='padding:20px,width:170px,height:40px'/> </div><div style='padding:2px;font-family:system-ui; background-color:" +
                        themeBGcolor +
                        ";'>    <p style='font-size:20px;font-weight:400;color:white;padding-left:20px',>  Document Copy</p></div><div><p style='padding:20px;font-family:system-ui;font-size:14px'>A copy of the document <strong>" +
                        pdfName +
                        ' </strong>is attached to this email. Kindly download the document from the attachment.</p></div> </div><div><p>This is an automated email from EducationCa™. For any queries regarding this email, please contact the sender ' +
                        sender.email +
                        ' directly. If you think this email is inappropriate or spam, you may file a complaint with EducationCa™  <a href= ' +
                        openSignUrl +
                        ' target=_blank>here</a> </p></div></div></body></html>',
                };
                sendMail = await axios.post(url, params, { headers: headers });
            } catch (error) {
                console.log('error', error);
                setIsLoading(false);
                setIsEmail(false);
                setIsAlert({
                    isShow: true,
                    alertMessage: t('something-went-wrong-mssg'),
                });
            }
        }
        if (sendMail?.data?.result?.status === 'success') {
            setSuccessEmail(true);
            setIsEmail(false);
            setTimeout(() => {
                setSuccessEmail(false);
                setEmailValue('');
                setEmailList([]);
            }, 1500);
            setIsLoading(false);
        } else {
            setIsLoading(false);
            setIsEmail(false);
            setIsAlert({
                isShow: true,
                alertMessage: t('something-went-wrong-mssg'),
            });
            setEmailValue('');
            setEmailList([]);
        }
    };

    //function for remove email
    const removeChip = (index) => {
        const updateEmailCount = emailList.filter((data, key) => key !== index);
        setEmailList(updateEmailCount);
    };
    //function for get email value
    const handleEmailValue = (e) => {
        const value = e.target?.value?.toLowerCase()?.replace(/\s/g, '');
        setEmailErr(false);
        setEmailValue(value);
    };

    //function for save email in array after press enter
    const handleEnterPress = (e) => {
        const pattern = emailRegex;
        const validate = emailValue?.match(pattern);
        if (e.key === 'Enter' && emailValue) {
            if (validate) {
                const emailLowerCase = emailValue?.toLowerCase();
                setEmailList((prev) => [...prev, emailLowerCase]);
                setEmailValue('');
            } else {
                setEmailErr(true);
            }
        } else if (e === 'add' && emailValue) {
            if (validate) {
                const emailLowerCase = emailValue?.toLowerCase();
                setEmailList((prev) => [...prev, emailLowerCase]);
                setEmailValue('');
            } else {
                setEmailErr(true);
            }
        }
    };
    const handleClose = () => {
        setIsEmail(false);
        setEmailValue('');
        setEmailList([]);
    };
    return (
        <div>
            {/* isEmail */}
            {isEmail && (
                <ModalUi
                    isOpen
                    showHeader={false}
                    title="Modal Title" // Provide the title here
                    handleClose={() => {
                        /* Handle close logic here */
                    }} // Provide a function to handle closing the modal
                    reduceWidth={false}
                >
                    {isLoading && (
                        <div className="absolute w-full h-full flex flex-col justify-center items-center z-[20] bg-[#e6f2f2]/70">
                            <Loader />
                            <span className="text-[12px] text-base-content">
                                {t('loader')}
                            </span>
                        </div>
                    )}
                    {isDownloading === 'pdf' && (
                        <div className="fixed z-[200] inset-0 flex justify-center items-center bg-black bg-opacity-30">
                            <Loader />
                        </div>
                    )}
                    <div className="flex justify-between items-center py-[10px] px-[20px] border-b-[1px] border-base-content">
                        <span className="text-base-content font-semibold">
                            {t('successfully-signed')}
                        </span>
                        <div className="flex flex-row">
                            {!isAndroid && (
                                <button
                                    onClick={(e) =>
                                        handleToPrint(
                                            e,
                                            pdfUrl,
                                            setIsDownloading,
                                            pdfDetails
                                        )
                                    }
                                    className="op-btn op-btn-neutral op-btn-sm text-[15px]"
                                >
                                    <i
                                        className="fa-light fa-print"
                                        aria-hidden="true"
                                    ></i>
                                    {t('print')}
                                </button>
                            )}
                            <button
                                className="op-btn op-btn-primary op-btn-sm text-[15px] ml-2"
                                onClick={() => {
                                    handleClose();
                                    setIsDownloadModal(true);
                                }}
                            >
                                <i
                                    className="fa-light fa-download"
                                    aria-hidden="true"
                                ></i>
                                {t('download')}
                            </button>
                        </div>
                    </div>
                    <div className="h-full p-[20px]">
                        <p className="font-medium text-[15px] mb-[5px] text-base-content align-baseline">
                            {t('email-mssg')}
                        </p>
                        {emailList.length > 0 ? (
                            <div className="p-0 border-[1.5px] op-border-primary rounded w-full text-[15px]">
                                <div className="flex flex-row flex-wrap">
                                    {emailList.map((data, ind) => {
                                        return (
                                            <div
                                                className="flex flex-row items-center op-bg-primary m-[4px] rounded-md py-[5px] px-[10px]"
                                                key={ind}
                                            >
                                                <span className="text-base-100 text-[13px]">
                                                    {data}
                                                </span>
                                                <span
                                                    className="text-base-100 text-[13px] font-semibold ml-[7px] cursor-pointer"
                                                    onClick={() =>
                                                        removeChip(ind)
                                                    }
                                                >
                                                    <i className="fa-light fa-xmark"></i>
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                {emailList.length <= 9 && (
                                    <input
                                        type="email"
                                        value={emailValue}
                                        className="p-[10px] pb-[20px] rounded w-full text-[15px] bg-transparent outline-none"
                                        onChange={handleEmailValue}
                                        onKeyDown={handleEnterPress}
                                        onBlur={() =>
                                            emailValue &&
                                            handleEnterPress('add')
                                        }
                                        onInvalid={(e) =>
                                            (
                                                e.target as HTMLInputElement
                                            ).setCustomValidity(
                                                t('input-required')
                                            )
                                        }
                                        onInput={(e) =>
                                            (
                                                e.target as HTMLInputElement
                                            ).setCustomValidity('')
                                        }
                                        required
                                    />
                                )}
                            </div>
                        ) : (
                            <div>
                                <input
                                    type="email"
                                    value={emailValue}
                                    className="p-[10px] pb-[20px] rounded w-full text-[15px] outline-none bg-transparent border-[1.5px] op-border-primary"
                                    onChange={handleEmailValue}
                                    onKeyDown={handleEnterPress}
                                    placeholder={t('enter-email-plaholder')}
                                    onBlur={() =>
                                        emailValue && handleEnterPress('add')
                                    }
                                    onInvalid={(e) =>
                                        (
                                            e.target as HTMLInputElement
                                        ).setCustomValidity(t('input-required'))
                                    }
                                    onInput={(e) =>
                                        (
                                            e.target as HTMLInputElement
                                        ).setCustomValidity('')
                                    }
                                    required
                                />
                            </div>
                        )}
                        {emailErr && (
                            <p className="text-xs text-[red] ml-1.5 mt-0.5">
                                {t('email-error-1')}
                            </p>
                        )}
                        <button
                            className={`${
                                emailValue ? 'cursor-pointer' : 'cursor-default'
                            } op-btn op-btn-primary op-btn-sm m-2 shadow-md`}
                            onClick={() =>
                                emailValue && handleEnterPress('add')
                            }
                        >
                            <i
                                className="fa-light fa-plus"
                                aria-hidden="true"
                            ></i>
                        </button>

                        <div className="bg-[#e3e2e1] mt-[10px] p-[5px] rounded">
                            <span className="font-bold">
                                {t('report-heading.Note')}:{' '}
                            </span>
                            <span className="text-[15px]">
                                {t('email-error-2')}
                            </span>
                        </div>
                        <hr className="w-full my-[15px] bg-base-content" />
                        <button
                            type="button"
                            className="op-btn op-btn-secondary"
                            onClick={() => emailList.length > 0 && sendEmail()}
                        >
                            {t('send')}
                        </button>
                        <button
                            type="button"
                            className="op-btn op-btn-ghost ml-2"
                            onClick={() => handleClose()}
                        >
                            {t('close')}
                        </button>
                    </div>
                </ModalUi>
            )}
        </div>
    );
}

export default EmailComponent;
