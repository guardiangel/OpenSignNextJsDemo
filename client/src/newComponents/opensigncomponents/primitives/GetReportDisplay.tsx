import Parse from "@/newComponents/opensigncomponents/parseClient";
import { Tour } from "@reactour/tour";
import axios from 'axios';
import Image from "next/image";
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useTranslation } from 'react-i18next';
// import ReactQuill from 'react-quill-new';
import AddSigner from '@newComponents/opensigncomponents/AddSigner';
import { serverUrl_fn } from '@newComponents/opensigncomponents/constant/appinfo';
import {
    EditorToolbar,
    formats,
    module1,
} from '@newComponents/opensigncomponents/pdf/EditorToolbar';
import EmbedTab from '@newComponents/opensigncomponents/pdf/EmbedTab';
import Select from 'react-select';
import { RWebShare } from 'react-web-share';
import pad from '../assets/images/pad.svg';
import BulkSendUi from '../BulkSendUi';
import { isEnableSubscription } from '../constant/const';
import {
    checkIsSubscribed,
    copytoData,
    fetchUrl,
    fileAdapterId_common,
    formatDate,
    getSignedUrl,
    getTenantDetails,
    handleSignatureType,
    OpenSignServerURL,
    replaceMailVaribles,
    signatureTypes,
    XParseApplicationId
} from '../constant/Utils';
import { validplan } from '../json/plansArr';
import Alert from './Alert';
import DownloadPdfZip from './DownloadPdfZip';
import Loader from './Loader';
import ModalUi from './ModalUi';
import SubscribeCard from './SubscribeCard';
import Tooltip from './Tooltip';

import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const ReportTable = (props) => {

    const router = useRouter();

    const { t } = useTranslation();

    const pathname = router.pathname;

    const isDashboard =
        location?.pathname === '/dashboard/35KBoSgoAK' ? true : false;
    const [currentPage, setCurrentPage] = useState(1);
    const [actLoader, setActLoader] = useState({});
    const [isAlert, setIsAlert] = useState(false);
    const [isContactform, setIsContactform] = useState(false);
    const [isDeleteModal, setIsDeleteModal] = useState({});
    const [isRevoke, setIsRevoke] = useState({});
    const [isShare, setIsShare] = useState({});
    const [shareUrls, setShareUrls] = useState([]);
    const [copied, setCopied] = useState<any>(false);
    const [isOption, setIsOption] = useState({});
    const [alertMsg, setAlertMsg] = useState({ type: 'success', message: '' });
    const [isTour, setIsTour] = useState(false);
    const [tourStatusArr, setTourStatusArr] = useState([]);
    const [isResendMail, setIsResendMail] = useState({});
    const [isMakePublicModal, setIsMakePublicModal] = useState({});
    const [mail, setMail] = useState({ subject: '', body: '' });
    const [userDetails, setUserDetails] = useState<any>({});
    const [isNextStep, setIsNextStep] = useState({});
    const [isBulkSend, setIsBulkSend] = useState({});
    const [templateDeatils, setTemplateDetails] = useState({});
    const [placeholders, setPlaceholders] = useState([]);
    const [isLoader, setIsLoader] = useState({});
    const [isShareWith, setIsShareWith] = useState({});
    const [teamList, setTeamList] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState<any[]>([]);
    const onChange = (selectedOptions) => setSelectedTeam(selectedOptions);
    const [selectedPublicRole, setSelectedPublicRole] = useState('');
    const [isCelebration, setIsCelebration] = useState(false);
    const [isPublicProfile, setIsPublicProfile] = useState({});
    const [publicUserName, setIsPublicUserName] = useState('');
    const [isViewShare, setIsViewShare] = useState({});
    const [isSubscribe, setIsSubscribe] = useState<any>(true);
    const [isModal, setIsModal] = useState({});
    const [reason, setReason] = useState('');
    const [isDownloadModal, setIsDownloadModal] = useState<any>(false);
    const [isEmbed, setIsEmbed] = useState(false);
    const [isPublicTour, setIsPublicTour] = useState<any>();
    const [signatureType, setSignatureType] = useState([]);
    const [expiryDate, setExpiryDate] = useState('');
    const Extand_Class = localStorage.getItem('Extand_Class')!;
    const extClass = Extand_Class && JSON.parse(Extand_Class);
    const startIndex = (currentPage - 1) * props.docPerPage;
    const { isMoreDocs, setIsNextRecord } = props;

    const getPaginationRange = () => {
        const totalPageNumbers = 7; // Adjust this value to show more/less page numbers
        const pages:any[] = [];
        const totalPages = Math.ceil(props.List.length / props.docPerPage);
        if (totalPages <= totalPageNumbers) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            const leftSiblingIndex = Math.max(currentPage - 1, 1);
            const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

            const showLeftDots = leftSiblingIndex > 2;
            const showRightDots = rightSiblingIndex < totalPages - 2;

            const firstPageIndex = 1;
            const lastPageIndex = totalPages;

            if (!showLeftDots && showRightDots) {
                let leftItemCount = 3;
                let leftRange = Array.from(
                    { length: leftItemCount },
                    (_, i) => i + 1
                );

                pages.push(...leftRange);
                pages.push('...');
                pages.push(totalPages);
            } else if (showLeftDots && !showRightDots) {
                let rightItemCount = 3;
                let rightRange = Array.from(
                    { length: rightItemCount },
                    (_, i) => totalPages - rightItemCount + i + 1
                );

                pages.push(firstPageIndex);
                pages.push('...');
                pages.push(...rightRange);
            } else if (showLeftDots && showRightDots) {
                let middleRange = Array.from(
                    { length: 3 },
                    (_, i) => leftSiblingIndex + i
                );

                pages.push(firstPageIndex);
                pages.push('...');
                pages.push(...middleRange);
                pages.push('...');
                pages.push(lastPageIndex);
            }
        }

        return pages;
    };
    const pageNumbers = getPaginationRange();
    //  below useEffect reset currenpage to 1 if user change route
    useEffect(() => {
        checkTourStatus();
        fetchTeamList();
        return () => setCurrentPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // `fetchTeamList` is used to fetch team list for share with functionality
    const fetchTeamList = async () => {
        if (props.ReportName === 'Templates') {
            try {
                const extUser = JSON.parse(
                    localStorage.getItem('Extand_Class')!
                )?.[0];
                if (extUser?.OrganizationId?.objectId) {
                    const teamtRes = await Parse.Cloud.run('getteams', {
                        active: true,
                    });
                    if (teamtRes.length > 0) {
                        const _teamRes = JSON.parse(JSON.stringify(teamtRes));
                        const formatedList = _teamRes.map((x) => ({
                            label: x.Name,
                            value: x.objectId,
                        }));
                        setTeamList(formatedList);
                        if (!isEnableSubscription) {
                            const selected = _teamRes.map(
                                (x) =>
                                    x.Name === 'All Users' && {
                                        label: x.Name,
                                        value: x.objectId,
                                    }
                            );
                            setSelectedTeam(selected);
                        }
                    }
                }
            } catch (err:any) {
                console.log('Err in fetch top level teamlist', err);
            }
        }
    };
    // `formatRow` is used to show data in poper manner like
    // if data is of array type then it will join array items with ","
    // if data is of object type then it Name values will be show in row
    // if no data available it will show hyphen "-"
    const formatRow = (row) => {
        if (Array.isArray(row)) {
            let updateArr = row.map((x) => x.Name);
            return updateArr.join(', ');
        } else if (typeof row === 'object' && row !== null) {
            return row?.Name || '-';
        } else {
            return '-';
        }
    };
    // below useEffect is used to render next record if IsMoreDoc is true
    // second last value of pageNumber array is same as currentPage
    useEffect(() => {
        if (isMoreDocs && pageNumbers[pageNumbers.length - 1] === currentPage) {
            setIsNextRecord(true);
        }
    }, [isMoreDocs, pageNumbers, currentPage, setIsNextRecord]);

    //function to fetch tenant Details
    const fetchTenantDetails = async () => {
        const user = JSON.parse(
            localStorage.getItem(
                `Parse/${XParseApplicationId}/currentUser`
            )!
        );
        if (user) {
            try {
                const tenantDetails = await getTenantDetails(user?.objectId,undefined,undefined);
                if (tenantDetails && tenantDetails === 'user does not exist!') {
                    alert(t('user-not-exist'));
                } else if (tenantDetails) {
                    const signatureType = tenantDetails?.SignatureType || [];
                    const filterSignTypes = signatureType?.filter(
                        (x) => x.enabled === true
                    );
                    return filterSignTypes;
                }
            } catch (e) {
                alert(t('user-not-exist'));
            }
        } else {
            alert(t('user-not-exist'));
        }
    };

    // `handleURL` is used to open microapp
    const handleURL = async (item, act) => {
        if (props.ReportName === 'Templates') {
            if (act.hoverLabel === 'Edit') {
                router.push(`/${act.redirectUrl}/${item.objectId}`);
            } else {
                setActLoader({ [`${item.objectId}_${act.btnId}`]: true });
                try {
                    const params = { templateId: item.objectId };
                    const templateDeatils = await axios.post(
                        `${OpenSignServerURL}/functions/getTemplate`,
                        params,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                'X-Parse-Application-Id':
                                    XParseApplicationId,
                                sessionToken:
                                    localStorage.getItem('accesstoken'),
                            },
                        }
                    );
                    const templateData =
                        templateDeatils.data && templateDeatils.data.result;
                    if (!templateData.error) {
                        const Doc = templateData;

                        let signers:any[] = [];
                        if (Doc.Signers?.length > 0) {
                            Doc.Signers?.forEach((x) => {
                                if (x.objectId) {
                                    const obj = {
                                        __type: 'Pointer',
                                        className: 'contracts_Contactbook',
                                        objectId: x.objectId,
                                    };
                                    signers.push(obj);
                                }
                            });
                        }

                        // console.log("extClass ", extClass);
                        let extUserId = Doc.ExtUserPtr.objectId;
                        let creatorId = Doc.CreatedBy.objectId;
                        if (extClass && extClass.length > 0) {
                            if (
                                Doc.ExtUserPtr?.objectId !==
                                extClass[0].objectId
                            ) {
                                const Extand_Class =
                                    localStorage.getItem('Extand_Class')!;
                                const extClass =
                                    Extand_Class && JSON.parse(Extand_Class);
                                if (extClass && extClass.length > 0) {
                                    extUserId = extClass[0].objectId;
                                    creatorId = extClass[0]?.UserId.objectId;
                                }
                            }
                        }
                        const tenantSignTypes = await fetchTenantDetails();
                        const docSignTypes =
                            Doc?.SignatureType || signatureTypes;
                        const updatedSignatureType = await handleSignatureType(
                            tenantSignTypes,
                            docSignTypes
                        );
                        const SignatureType =
                            updatedSignatureType.length > 0
                                ? { SignatureType: updatedSignatureType }
                                : {};
                        const NotifyOnSignatures =
                            Doc.NotifyOnSignatures !== undefined
                                ? { NotifyOnSignatures: Doc.NotifyOnSignatures }
                                : {};
                        let placeholdersArr = [];
                        if (Doc.Placeholders?.length > 0) {
                            placeholdersArr = Doc.Placeholders;
                            const data = {
                                Name: Doc.Name,
                                URL: Doc.URL,
                                SignedUrl: Doc.SignedUrl,
                                SentToOthers: Doc?.SentToOthers || false,
                                Description: Doc.Description,
                                Note: Doc.Note,
                                Placeholders: placeholdersArr,
                                ExtUserPtr: {
                                    __type: 'Pointer',
                                    className: 'contracts_Users',
                                    objectId: extUserId,
                                },
                                CreatedBy: {
                                    __type: 'Pointer',
                                    className: '_User',
                                    objectId: creatorId,
                                },
                                Signers: signers,
                                SendinOrder: Doc?.SendinOrder || false,
                                AutomaticReminders:
                                    Doc?.AutomaticReminders || false,
                                RemindOnceInEvery: Doc?.RemindOnceInEvery || 5,
                                IsEnableOTP: Doc?.IsEnableOTP || false,
                                FileAdapterId: Doc?.FileAdapterId || fileAdapterId_common,
                                ...SignatureType,
                                ...NotifyOnSignatures,
                            };
                            try {
                                const res = await axios.post(
                                    `${localStorage.getItem(
                                        'baseUrl'
                                    )}classes/contracts_Document`,
                                    data,
                                    {
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'X-Parse-Application-Id':
                                                localStorage.getItem(
                                                    'parseAppId'
                                                ),
                                            'X-Parse-Session-Token':
                                                localStorage.getItem(
                                                    'accesstoken'
                                                ),
                                        },
                                    }
                                );

                                if (res.data && res.data.objectId) {
                                    setActLoader({});
                                    setIsAlert(true);
                                    setTimeout(() => setIsAlert(false), 1500);
                                    router.push({
                                         pathname:`/${act.redirectUrl}/${res.data.objectId}`,
                                         query:{
                                             title: 'Use Template'
                                        }
                                });
                                }
                            } catch (err:any) {
                                console.log('Err', err);
                                setIsAlert(true);
                                setAlertMsg({
                                    type: 'danger',
                                    message: t('something-went-wrong-mssg'),
                                });
                                setTimeout(() => setIsAlert(false), 1500);
                                setActLoader({});
                            }
                        } else {
                            setActLoader({});
                        }
                    } else {
                        setIsAlert(true);
                        setAlertMsg({
                            type: 'danger',
                            message: t('something-went-wrong-mssg'),
                        });
                        setTimeout(() => setIsAlert(false), 1500);
                        setActLoader({});
                    }
                } catch (err:any) {
                    console.log('err', err);
                    setIsAlert(true);
                    setAlertMsg({
                        type: 'danger',
                        message: t('something-went-wrong-mssg'),
                    });
                    setTimeout(() => setIsAlert(false), 1500);
                    setActLoader({});
                }
            }
        } else {
            router.push(`/${act.redirectUrl}?docId=${item?.objectId}`);
        }
    };

    const handleActionBtn = async (act, item) => {
        if (act.action === 'redirect') {
            handleURL(item, act);
        } else if (act.action === 'delete') {
            setIsDeleteModal({ [item.objectId]: true });
        } else if (act.action === 'share') {
            handleShare(item);
        } else if (act.action === 'revoke') {
            setIsRevoke({ [item.objectId]: true });
        } else if (act.action === 'option') {
            setIsOption({ [item.objectId]: !isOption[item.objectId] });
        } else if (act.action === 'resend') {
            console.log("GetReportDisplay.tsx item.objectId",item.objectId);
            setIsResendMail({ [item.objectId]: true });
        } else if (act.action === 'bulksend') {
            handleBulkSend(item);
        } else if (act.action === 'sharewith') {
            if (isEnableSubscription) {
                const subscribe = await checkIsSubscribed("");
                setIsSubscribe(subscribe);
            } else {
                setIsSubscribe({ plan: 'teams-yearly', isValid: true });
            }
            if (item?.SharedWith && item?.SharedWith.length > 0) {
                // below code is used to get existing sharewith teams and formated them as per react-select
                const formatedList = item?.SharedWith.map((x) => ({
                    label: x.Name,
                    value: x.objectId,
                }));
                setSelectedTeam(formatedList);
            }
            setIsShareWith({ [item.objectId]: true });
        } else if (act.action === 'Embed') {
            handleEmbedFunction(item);
        } else if (act.action === 'CopyTemplateId') {
            copyTemplateId(item.objectId);
        } else if (act.action === 'CopyPublicURL') {
            const isPublic = item?.IsPublic;
            if (isPublic) {
                let publicUrl = '';
                    publicUrl = `https://opensign.me/publicsign?templateid=${item.objectId}`;
                copyTemplateId(publicUrl);
            } else {
                setIsPublicTour({ [item.objectId]: true });
            }
        } else if (act.action) {
            setIsModal({ [`extendexpiry_${item.objectId}`]: true });
        }
    };
    // Get current list
    const indexOfLastDoc = currentPage * props.docPerPage;
    const indexOfFirstDoc = indexOfLastDoc - props.docPerPage;
    const currentList = props.List?.slice(indexOfFirstDoc, indexOfLastDoc);

    // Change page
    const paginateFront = () => {
        const lastValue = pageNumbers?.[pageNumbers?.length - 1];
        if (currentPage < lastValue) {
            setCurrentPage(currentPage + 1);
        }
    };

    const paginateBack = () => {
        if (startIndex > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleContactFormModal = () => {
        setIsContactform(!isContactform);
    };

    const handleUserData = (data) => {
        props.setList((prevData) => [data, ...prevData]);
    };

    const handleDelete = async (item) => {
        setIsDeleteModal({});
        setActLoader({ [`${item.objectId}`]: true });
        const clsObj = {
            Contactbook: 'contracts_Contactbook',
            Templates: 'contracts_Template',
        };
        try {
            const serverUrl = serverUrl_fn();
            const cls = clsObj[props.ReportName] || 'contracts_Document';
            const url = serverUrl + `/classes/${cls}/`;
            const body =
                props.ReportName === 'Contactbook'
                    ? { IsDeleted: true }
                    : { IsArchive: true };
            const res = await axios.put(url + item.objectId, body, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Parse-Application-Id':
                        XParseApplicationId,
                    'X-Parse-Session-Token':
                        localStorage.getItem('accesstoken'),
                },
            });
            if (res.data && res.data.updatedAt) {
                setActLoader({});
                setIsAlert(true);
                setAlertMsg({
                    type: 'success',
                    message: t('record-delete-alert'),
                });
                setTimeout(() => setIsAlert(false), 1500);
                const upldatedList = props.List.filter(
                    (x) => x.objectId !== item.objectId
                );
                props.setList(upldatedList);
            }
        } catch (err:any) {
            console.log('err', err);
            setIsAlert(true);
            setAlertMsg({
                type: 'danger',
                message: t('something-went-wrong-mssg'),
            });
            setTimeout(() => setIsAlert(false), 1500);
            setActLoader({});
        }
    };
    const handleClose = (item) => {
        setIsRevoke({});
        setIsDeleteModal({});
        setIsMakePublicModal({});
        setSelectedPublicRole('');
        setIsPublicProfile({});
        if (item?.objectId) {
            props.setIsPublic((prevStates) => ({
                ...prevStates,
                [item.objectId]: !prevStates[item.objectId],
            }));
        }
        setReason('');
    };
    const handleShare = (item) => {
        setActLoader({ [item.objectId]: true });
        const host = window.location.origin;
        const sendMail = item?.SendMail || false;
        const getUrl = (x) => {
            //encode this url value `${item.objectId}/${x.Email}/${x.objectId}` to base64 using `btoa` function
            if (x?.signerObjId) {
                const encodeBase64 = btoa(
                    `${item.objectId}/${x.signerPtr.Email}/${x.signerPtr.objectId}/${sendMail}`
                );
                return `${host}/login/${encodeBase64}`;
            } else {
                const encodeBase64 = btoa(`${item.objectId}/${x.email}`);
                return `${host}/login/${encodeBase64}`;
            }
        };
        const urls = item?.Placeholders?.map((x) => ({
            email: x.email ? x.email : x.signerPtr.Email,
            url: getUrl(x),
        }));
        setShareUrls(urls);
        setIsShare({ [item.objectId]: true });
    };

    const copytoclipboard = (share) => {
        copytoData(share.url);
        setCopied({ ...copied, [share.email]: true });
    };
    //function to handle revoke/decline docment
    const handleRevoke = async (item) => {
        const senderUser = localStorage.getItem(
            `Parse/${XParseApplicationId}/currentUser`
        )!;
        const jsonSender = JSON.parse(senderUser);
        setIsRevoke({});
        setActLoader({ [`${item.objectId}`]: true });
        const data = {
            IsDeclined: true,
            DeclineReason: reason,
            DeclineBy: {
                __type: 'Pointer',
                className: '_User',
                objectId: jsonSender?.objectId,
            },
        };
        await axios
            .put(
                `${OpenSignServerURL}/classes/contracts_Document/${
                    item.objectId
                }`,
                data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Parse-Application-Id':
                            XParseApplicationId,
                        'X-Parse-Session-Token':
                            localStorage.getItem('accesstoken'),
                    },
                }
            )
            .then(async (result) => {
                const res = result.data;
                if (res) {
                    setActLoader({});
                    setIsAlert(true);
                    setAlertMsg({
                        type: 'success',
                        message: t('record-revoke-alert'),
                    });
                    setTimeout(() => setIsAlert(false), 1500);
                    const upldatedList = props.List.filter(
                        (x) => x.objectId !== item.objectId
                    );
                    props.setList(upldatedList);
                    const params = {
                        event: 'declined',
                        body: {
                            objectId: item.objectId,
                            file: item?.SignedUrl || item?.URL,
                            name: item?.Name,
                            note: item?.Note || '',
                            description: item?.Description || '',
                            signers: item?.Signers?.map((x) => ({
                                name: x?.Name,
                                email: x?.Email,
                                phone: x?.Phone,
                            })),
                            declinedBy: jsonSender?.email,
                            declinedReason: reason,
                            declinedAt: new Date(),
                            createdAt: item?.createdAt,
                        },
                    };

                    try {
                        await axios.post(
                            `${OpenSignServerURL}/functions/callwebhook`,
                            params,
                            {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-Parse-Application-Id':
                                        XParseApplicationId,
                                    sessiontoken:
                                        localStorage.getItem('accesstoken'),
                                },
                            }
                        );
                    } catch (err:any) {
                        console.log('Err ', err);
                    }
                }
                setReason('');
            })
            .catch((err) => {
                console.log('err', err);
                setReason('');
                setIsAlert(true);
                setAlertMsg({
                    type: 'danger',
                    message: t('something-went-wrong-mssg'),
                });
                setTimeout(() => setIsAlert(false), 1500);
                setActLoader({});
            });
    };

    async function checkTourStatus() {
        const cloudRes = await Parse.Cloud.run('getUserDetails');
        if (cloudRes) {
            const extUser = JSON.parse(JSON.stringify(cloudRes));
            localStorage.setItem('Extand_Class', JSON.stringify([extUser]));
            const tourStatus = extUser?.TourStatus || [];
            setTourStatusArr(tourStatus);
            const templateTour = tourStatus.find(
                (obj) => obj.templateTour
            )?.templateTour;
            setIsTour(!templateTour);
        } else {
            setIsTour(true);
        }
    }

    const closeTour = async () => {
        setIsTour(false);
        if (props.isDontShow) {
            const serverUrl = OpenSignServerURL;
            const appId = XParseApplicationId;
            const json = JSON.parse(localStorage.getItem('Extand_Class')!);
            const extUserId = json && json.length > 0 && json[0].objectId;
            let updatedTourStatus:any[] = [];
            if (tourStatusArr.length > 0) {
                updatedTourStatus = [...tourStatusArr];
                const templateTourIndex = tourStatusArr.findIndex(
                    (obj) =>
                        obj['templateTour'] === false ||
                        obj['templateTour'] === true
                );
                if (templateTourIndex !== -1) {
                    updatedTourStatus[templateTourIndex] = {
                        templateTour: true,
                    };
                } else {
                    updatedTourStatus.push({ templateTour: true });
                }
            } else {
                updatedTourStatus = [{ templateTour: true }];
            }

            await axios.put(
                serverUrl + 'classes/contracts_Users/' + extUserId,
                { TourStatus: updatedTourStatus },
                { headers: { 'X-Parse-Application-Id': appId } }
            );
        }
    };

    // `handleDownload` is used to get valid doc url available in completed report
    const handleDownload = async (item) => {
        setActLoader({ [`${item.objectId}`]: true });
        const url = item?.SignedUrl || item?.URL || '';
        const pdfName = item?.Name || 'exported_file';
        const isCompleted = item?.IsCompleted || false;
        const templateId = props?.ReportName === 'Templates' && item.objectId;
        const docId = props?.ReportName !== 'Templates' && item.objectId;
        const fileAdapterId = item?.FileAdapterId ? item?.FileAdapterId : fileAdapterId_common;

        if (url) {
            try {
                if (isCompleted) {
                    setIsDownloadModal({ [item.objectId]: true });
                } else {
                    const signedUrl = await getSignedUrl(
                        url,
                        docId,
                        fileAdapterId,
                        templateId
                    );
                    await fetchUrl(signedUrl, pdfName);
                }
                setActLoader({});
            } catch (err:any) {
                console.log('err in getsignedurl', err);
                alert(t('something-went-wrong-mssg'));
                setActLoader({});
            }
        }
    };

    // `handleSubjectChange` is used to add or change subject of resend mail
    const handleSubjectChange = (subject, doc) => {
        const encodeBase64 = userDetails?.objectId
            ? btoa(
                  `${doc.objectId}/${userDetails.Email}/${userDetails.objectId}`
              )
            : btoa(`${doc.objectId}/${userDetails.Email}`);
        const expireDate = doc.ExpiryDate.iso;
        const newDate = new Date(expireDate);
        const localExpireDate = newDate.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
        const signPdf = `${window.location.origin}/login/${encodeBase64}`;
        const variables = {
            document_title: doc.Name,
            sender_name: doc.ExtUserPtr.Name,
            sender_mail: doc.ExtUserPtr.Email,
            sender_phone: doc.ExtUserPtr?.Phone || '',
            receiver_name: userDetails?.Name,
            receiver_email: userDetails?.Email,
            receiver_phone: userDetails?.Phone || '',
            expiry_date: localExpireDate,
            company_name: doc.ExtUserPtr.Company,
            signing_url: `<a href=${signPdf} target=_blank>Sign here</a>`,
        };
        const res = replaceMailVaribles(subject, '', variables);

        setMail((prev) => ({ ...prev, subject: res.subject }));
    };
    // `handlebodyChange` is used to add or change body of resend mail
    const handlebodyChange = (body, doc) => {
        const encodeBase64 = userDetails?.objectId
            ? btoa(
                  `${doc.objectId}/${userDetails.Email}/${userDetails.objectId}`
              )
            : btoa(`${doc.objectId}/${userDetails.Email}`);
        const expireDate = doc.ExpiryDate.iso;
        const newDate = new Date(expireDate);
        const localExpireDate = newDate.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
        const signPdf = `${window.location.origin}/login/${encodeBase64}`;
        const variables = {
            document_title: doc.Name,
            sender_name: doc.ExtUserPtr.Name,
            sender_mail: doc.ExtUserPtr.Email,
            sender_phone: doc.ExtUserPtr?.Phone || '',
            receiver_name: userDetails?.Name || '',
            receiver_email: userDetails?.Email || '',
            receiver_phone: userDetails?.Phone || '',
            expiry_date: localExpireDate,
            company_name: doc.ExtUserPtr.Company,
            signing_url: `<a href=${signPdf} target=_blank>Sign here</a>`,
        };
        const res = replaceMailVaribles('', body, variables);

        if (body) {
            setMail((prev) => ({ ...prev, body: res.body }));
        }
    };
    // `handleNextBtn` is used to open edit mail template screen in resend mail modal
    // as well as replace variable with original one
    const handleNextBtn = (user, doc) => {
        const userdata = {
            Name: user?.signerPtr?.Name,
            Email: user.email ? user?.email : user.signerPtr?.Email,
            Phone: user?.signerPtr?.Phone,
            objectId: user?.signerPtr?.objectId,
        };
        setUserDetails(userdata);
        const encodeBase64 = user.email
            ? btoa(`${doc.objectId}/${user.email}`)
            : btoa(
                  `${doc.objectId}/${user.signerPtr.Email}/${user.signerPtr.objectId}`
              );
        const expireDate = doc.ExpiryDate.iso;
        const newDate = new Date(expireDate);
        const localExpireDate = newDate.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
        const signPdf = `${window.location.origin}/login/${encodeBase64}`;
        const variables = {
            document_title: doc.Name,
            sender_name: doc.ExtUserPtr.Name,
            sender_mail: doc.ExtUserPtr.Email,
            sender_phone: doc.ExtUserPtr?.Phone || '',
            receiver_name: user?.signerPtr?.Name || '',
            receiver_email: user?.email ? user?.email : user?.signerPtr?.Email,
            receiver_phone: user?.signerPtr?.Phone || '',
            expiry_date: localExpireDate,
            company_name: doc?.ExtUserPtr?.Company || '',
            signing_url: `<a href=${signPdf} target=_blank>Sign here</a>`,
        };

        const subject =
            doc?.RequestSubject ||
            `{{sender_name}} has requested you to sign "{{document_title}}"`;
        const body =
            doc?.RequestBody ||
            `<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /></head><body><p>Hi {{receiver_name}},</p><br><p>We hope this email finds you well. {{sender_name}} has requested you to review and sign <b>"{{document_title}}"</b>.</p><p>Your signature is crucial to proceed with the next steps as it signifies your agreement and authorization.</p><br><p>{{signing_url}}</p><br><p>If you have any questions or need further clarification regarding the document or the signing process,  please contact the sender.</p><br><p>Thanks</p><p> Team EducationCa™</p><br></body> </html>`;
        const res = replaceMailVaribles(subject, body, variables);
        setMail((prev) => ({ ...prev, subject: res.subject, body: res.body }));
        setIsNextStep({ [user.Id]: true });
    };
    const handleResendMail = async (e, doc, user) => {
        e.preventDefault();
        setActLoader({ [user?.Id]: true });
        const url = `${OpenSignServerURL}/functions/sendmailv3`;
        const headers = {
            'Content-Type': 'application/json',
            'X-Parse-Application-Id': XParseApplicationId,
            sessionToken: localStorage.getItem('accesstoken'),
        };
        let params = {
            mailProvider: doc?.ExtUserPtr?.active_mail_adapter || '',
            extUserId: doc?.ExtUserPtr?.objectId,
            recipient: userDetails?.Email,
            subject: mail.subject,
            from: doc?.ExtUserPtr?.Email,
            html: mail.body,
        };
        try {
            const res = await axios.post(url, params, { headers: headers });
            if (res?.data?.result?.status === 'success') {
                setIsAlert(true);
                setAlertMsg({ type: 'success', message: t('mail-sent-alert') });
            } else {
                setIsAlert(true);
                setAlertMsg({
                    type: 'danger',
                    message: t('something-went-wrong-mssg'),
                });
            }
        } catch (err:any) {
            console.log('err in sendmail', err);
            setIsAlert(true);
            setAlertMsg({
                type: 'danger',
                message: t('something-went-wrong-mssg'),
            });
        } finally {
            setTimeout(() => setIsAlert(false), 1500);
            setIsNextStep({});
            setUserDetails({});
            setActLoader({});
        }
    };
    const fetchUserStatus = (user, doc) => {
        const email = user.email ? user.email : user.signerPtr.Email;
        const audit = doc?.AuditTrail?.find((x) => x.UserPtr.Email === email);

        return (
            <div className="flex flex-row gap-2 justify-center items-center">
                <div className="flex justify-center items-center bg-base-300 text-base-content shadow-md op-card w-[65px] h-[32px] cursor-default">
                    {audit?.Activity ? audit?.Activity : 'Awaited'}
                </div>

                <button
                    onClick={() => handleNextBtn(user, doc)}
                    className={
                        audit?.Activity !== 'Signed'
                            ? 'op-btn op-btn-primary op-btn-sm'
                            : ' text-transparent cursor-default pointer-events-none'
                    }
                    disabled={audit?.Activity === 'Signed'}
                >
                    {audit?.Activity !== 'Signed' && 'Resend'}
                </button>
            </div>
        );
    };
    // `handleQuickSendClose` is trigger when bulk send component trigger close event
    const handleQuickSendClose = (status, count) => {
        setIsBulkSend({});
        setIsAlert(true);
        if (status === 'success') {
            if (count > 1) {
                setAlertMsg({
                    type: 'success',
                    message: count + ' ' + t('document-sent-alert'),
                });
                setTimeout(() => setIsAlert(false), 1500);
            } else {
                setAlertMsg({
                    type: 'success',
                    message: count + ' ' + t('document-sent-alert'),
                });
                setTimeout(() => setIsAlert(false), 1500);
            }
        } else {
            setAlertMsg({
                type: 'danger',
                message: t('something-went-wrong-mssg'),
            });
            setTimeout(() => setIsAlert(false), 1500);
        }
    };

    // `handleBulkSend` is used to open modal as well as fetch template
    // and show Ui on the basis template response
    const handleBulkSend = async (template) => {
        setIsBulkSend({ [template.objectId]: true });
        setIsLoader({ [template.objectId]: true });
        try {
            const params = {
                templateId: template.objectId,
                include: ['Placeholders.signerPtr'],
            };
            const axiosRes = await axios.post(
                `${OpenSignServerURL}/functions/getTemplate`,
                params,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Parse-Application-Id':
                            XParseApplicationId,
                        sessionToken: localStorage.getItem('accesstoken'),
                    },
                }
            );
            const templateRes = axiosRes.data && axiosRes.data.result;
            const tenantSignTypes = await fetchTenantDetails();
            const docSignTypes = templateRes?.SignatureType || signatureTypes;
            const updatedSignatureType = await handleSignatureType(
                tenantSignTypes,
                docSignTypes
            );
            setSignatureType(updatedSignatureType);
            setPlaceholders(templateRes?.Placeholders);
            setTemplateDetails(templateRes);
            setIsLoader({});
        } catch (err:any) {
            console.log('err in fetch template in bulk modal', err);
            setIsBulkSend({});
            setIsAlert(true);
            setAlertMsg({
                type: 'danger',
                message: t('something-went-wrong-mssg'),
            });
            setTimeout(() => setIsAlert(false), 1500);
        }
    };
    //function to make template public and set public role
    const handlePublicTemplate = async (item) => {
        if (selectedPublicRole || !props.isPublic[item.objectId]) {
            setActLoader({ [item.objectId]: true });
            setIsMakePublicModal(false);
            try {
                const res = await Parse.Cloud.run('createpublictemplate', {
                    templateid: item.objectId,
                    ispublic: props.isPublic[item.objectId],
                    publicrole: [selectedPublicRole],
                });

                if (res.status === 'success') {
                    setIsAlert(true);
                    setTimeout(() => setIsAlert(false), 1500);
                    if (props.isPublic[item.objectId]) {
                        setAlertMsg({
                            type: 'success',
                            message: t('template-public-alert-1'),
                        });
                        setIsCelebration(true);
                        setTimeout(() => {
                            setIsCelebration(false);
                        }, 5000);
                        setIsPublicProfile({
                            [item.objectId]: props.isPublic[item.objectId],
                        });
                    } else {
                        setAlertMsg({
                            type: 'success',
                            message: t('template-public-alert-2'),
                        });
                        setSelectedPublicRole('');
                    }
                    const updateList = props.List.map((x) =>
                        x.objectId === item.objectId
                            ? { ...x, IsPublic: props.isPublic[item.objectId] }
                            : x
                    );
                    props.setList(updateList);
                    setActLoader({});
                }
            } catch (e) {
                console.log('error in createpublictemplate', e);
                setIsAlert(true);
                setAlertMsg({
                    type: 'danger',
                    message: t('something-went-wrong-mssg'),
                });
                setTimeout(() => setIsAlert(false), 1500);
                props.setIsPublic((prevStates) => ({
                    ...prevStates,
                    [item.objectId]: !prevStates[item.objectId],
                }));
            }
        } else {
            setIsAlert(true);
            setAlertMsg({
                type: 'danger',
                message: t('template-public-alert-3'),
            });
            setTimeout(() => setIsAlert(false), 1500);
        }
    };

    const handleViewSigners = (item) => {
        setIsViewShare({ [item.objectId]: true });
    };
    //function to handle change template status is public or private
    const handlePublicChange = async (e, item) => {
        const getPlaceholder = item?.Placeholders;
        //checking index for public role
        const getIndex = getPlaceholder?.findIndex((obj) => !obj?.signerObjId);
        //conditon to check empty role is exist or not
        if (getPlaceholder && getPlaceholder.length > 0 && getIndex >= 0) {
            const signers = item?.Signers;
            //condition to check that every role is attached to signers except the public role.
            if (getPlaceholder.length - 1 === signers?.length) {
                //check template send in order
                const IsSendInOrder = item?.SendinOrder;
                //condition for if send in order true then the public role order should be prioritized.
                //When send in order is false and there's no need to verify the public role's order
                if ((IsSendInOrder && getIndex === 0) || !IsSendInOrder) {
                    const checkIsSignatureExist = getPlaceholder?.every(
                        (placeholderObj) =>
                            placeholderObj?.placeHolder?.some((holder) =>
                                holder?.pos?.some(
                                    (posItem) => posItem?.type === 'signature'
                                )
                            )
                    );
                    //condition for validate signature widgets should be all signers
                    if (checkIsSignatureExist) {
                        let extendUser = JSON.parse(
                            localStorage.getItem('Extand_Class')!
                        );
                        const userName = extendUser[0]?.UserName;
                        setIsPublicUserName(extendUser[0]?.UserName);
                        //condition to check user have public url or not
                        if (userName) {
                            //`setIsPublic` variable is used to collect all template public status
                            props.setIsPublic((prevStates) => ({
                                ...prevStates,
                                [item.objectId]: e.target?.checked,
                            }));
                            if (getPlaceholder[getIndex]?.Role) {
                                setSelectedPublicRole(
                                    getPlaceholder[getIndex].Role
                                );
                            }
                            //`setIsMakePublicModal` is used to open modal after succesfully make public
                            setIsMakePublicModal({ [item.objectId]: true });
                        } else {
                            setIsPublicProfile({ [item.objectId]: true });
                        }
                    } else {
                        setIsAlert(true);
                        setAlertMsg({
                            type: 'danger',
                            message: t('template-public-alert-4'),
                        });
                        setTimeout(() => setIsAlert(false), 5000);
                    }
                } else if (IsSendInOrder) {
                    setIsAlert(true);
                    setAlertMsg({
                        type: 'danger',
                        message: t('template-public-alert-5'),
                    });
                    setTimeout(() => setIsAlert(false), 5000);
                }
            } else {
                setIsAlert(true);
                setAlertMsg({
                    type: 'danger',
                    message: t('template-public-alert-6'),
                });
                setTimeout(() => setIsAlert(false), 5000);
            }
        } else {
            setIsAlert(true);
            setAlertMsg({
                type: 'danger',
                message: t('template-public-alert-7'),
            });
            setTimeout(() => setIsAlert(false), 5000);
        }
    };

    const publicUrl = () => {
        const subDomain = `https://educationCa.com`;
        const url = `${subDomain}${publicUserName}`;
        return url;
    };
    // function to copy public profile links
    const copytoProfileLink = () => {
        const url = publicUrl();
        copytoData(url);
        setIsAlert(true);
        setAlertMsg({
            type: 'success',
            message: t('copied'),
        });
        setCopied({ ...copied, publicprofile: true });
        setTimeout(() => {
            setIsAlert(false);
            setCopied(false);
        }, 1500);
    };

    const copyTemplateId = (templateid) => {
        copytoData(templateid);
        setIsAlert(true);
        setAlertMsg({
            type: 'success',
            message: t('copied'),
        });
        setCopied({ ...copied, templateid: true });
        setTimeout(() => {
            setIsAlert(false);
            setCopied(false);
        }, 1500);
    };
    const handleShowRole = (item) => {
        const getRole = item.Placeholders.find((data) => !data.signerObjId);
        return getRole?.Role;
    };
    // `handleShareWith` is used to save teams in sharedWith field
    const handleShareWith = async (e, template) => {
        e.preventDefault();
        e.stopPropagation();
        setIsShareWith({});
        setActLoader({ [template.objectId]: true });
        try {
            const templateCls = new Parse.Object('contracts_Template');
            templateCls.id = template.objectId;
            const teamArr = selectedTeam.map((x:any) => ({
                __type: 'Pointer',
                className: 'contracts_Teams',
                objectId: x.value,
            }));
            templateCls.set('SharedWith', teamArr);
            const res = await templateCls.save();
            if (res) {
                setIsAlert(true);
                setAlertMsg({
                    type: 'success',
                    message: t('template-share-alert'),
                });
            }
        } catch (err:any) {
            setIsAlert(true);
            setAlertMsg({
                type: 'danger',
                message: t('something-went-wrong-mssg'),
            });
        } finally {
            setActLoader({});
            setTimeout(() => setIsAlert(false), 1500);
        }
    };
    const handleEmbedFunction = async (item) => {
        setIsEmbed(true);
        setIsPublicProfile({
            [item.objectId]: true,
        });
        let extendUser = JSON.parse(localStorage.getItem('Extand_Class')!);
        setIsPublicUserName(extendUser[0]?.UserName || '');
    };

    const publicTourConfig = [
        {
            selector: '[data-tut="IsPublic"]',
            content: t('public-tour-message'),
            position: 'top',
            style: { fontSize: '13px' },
        },
    ];
    const closePublicTour = () => {
        setIsPublicTour(false);
    };
    const handleUpdateExpiry = async (e, item) => {
        e.preventDefault();
        e.stopPropagation();
        if (expiryDate) {
            const oldExpiryDate = new Date(item?.ExpiryDate?.iso);
            const newExpiryDate = new Date(expiryDate);
            if (newExpiryDate > oldExpiryDate) {
                setActLoader({ [`${item.objectId}`]: true });
                const updateExpiryDate = new Date(expiryDate).toISOString();
                const expiryIsoFormat = {
                    iso: updateExpiryDate,
                    __type: 'Date',
                };
                try {
                    const serverUrl = serverUrl_fn();
                    const cls = 'contracts_Document';
                    const url = serverUrl + `/classes/${cls}/`;
                    const body = { ExpiryDate: expiryIsoFormat };
                    const res = await axios.put(url + item.objectId, body, {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Parse-Application-Id':
                                XParseApplicationId,
                            'X-Parse-Session-Token':
                                localStorage.getItem('accesstoken'),
                        },
                    });
                    if (res.data && res.data.updatedAt) {
                        setIsAlert(true);
                        setAlertMsg({
                            type: 'success',
                            message: t('expiry-date-updated', {
                                newexpirydate: new Date(
                                    expiryDate
                                )?.toLocaleDateString(),
                            }),
                        });
                        if (props.ReportName === 'Expired Documents') {
                            const upldatedList = props.List.filter(
                                (x) => x.objectId !== item.objectId
                            );
                            props.setList(upldatedList);
                        }
                    }
                } catch (err:any) {
                    console.log('err', err);
                    setIsAlert(true);
                    setAlertMsg({
                        type: 'danger',
                        message: t('something-went-wrong-mssg'),
                    });
                } finally {
                    setActLoader({});
                    setExpiryDate("");
                    setTimeout(() => setIsAlert(false), 2000);
                    setIsModal({});
                }
            } else {
                setIsAlert(true);
                setAlertMsg({
                    type: 'danger',
                    message: t('expiry-date-error'),
                });
                setTimeout(() => setIsAlert(false), 2000);
            }
        } else {
            setIsAlert(true);
            setAlertMsg({ type: 'danger', message: t('expiry-date-error') });
            setTimeout(() => setIsAlert(false), 2000);
        }
    };
    // `formatStatusRow` is used to format status row
    const formatStatusRow = (item) => {
        const signers = item?.Placeholders?.map((x, i) => {
            const matchSigner = item?.AuditTrail?.find(
                (audit) => audit?.UserPtr?.objectId === x.signerObjId
            );
            if (matchSigner) {
                return {
                    id: i,
                    Email: matchSigner.UserPtr.Email,
                    Activity: matchSigner?.Activity?.toUpperCase() || '-',
                    SignedOn: matchSigner?.SignedOn
                        ? new Date(matchSigner?.SignedOn)?.toUTCString()
                        : '-',
                    ViewedOn: matchSigner?.ViewedOn
                        ? new Date(matchSigner?.ViewedOn)?.toUTCString()
                        : '-',
                };
            } else {
                return {
                    id: i,
                    Email: x?.signerPtr?.Email || x?.email,
                    Activity: 'SENT',
                    SignedOn: '-',
                    ViewedOn: '-',
                };
            }
        });
        return signers?.map((x, i) => (
            <div
                key={i}
                className="text-sm font-medium flex flex-row gap-2 items-center"
            >
                <button
                    onClick={() =>
                        setIsModal({ [`${item.objectId}_${i}`]: true })
                    }
                    className={`${
                        x.Activity === 'SIGNED'
                            ? 'op-border-primary op-text-primary'
                            : x.Activity === 'VIEWED'
                              ? 'border-green-400 text-green-400'
                              : 'border-black text-black'
                    } focus:outline-none border-2 w-[60px] h-[30px] text-[11px] rounded-full`}
                >
                    {x?.Activity?.toUpperCase() || '-'}
                </button>
                <div className="py-2 font-bold text-[12px]">
                    {x?.Email || '-'}
                </div>
                {isModal[`${item.objectId}_${i}`] && (
                    <ModalUi
                        isOpen
                        title={t('document-logs')}
                        handleClose={() => setIsModal({})}
                        reduceWidth={true} 
                    >
                        <div className="pl-3 first:mt-2 border-t-[1px] border-gray-600 text-[12px] py-2">
                            <p className="font-bold"> {x?.Email}</p>
                            <p>Viewed on: {x?.ViewedOn}</p>
                            <p>Signed on: {x?.SignedOn}</p>
                        </div>
                    </ModalUi>
                )}
            </div>
        ));
    };
    return (
        <div className="relative">
            {Object.keys(actLoader)?.length > 0 && (
                <div className="absolute w-full h-full flex justify-center items-center bg-black bg-opacity-30 z-30">
                    <Loader />
                </div>
            )}
            <div className="p-2 w-full bg-base-100 text-base-content op-card shadow-lg">
                {isCelebration && (
                    <div className="relative z-[1000]">
                        <Confetti
                            width={window.innerWidth}
                            height={window.innerHeight}
                            recycle={false} // Prevents confetti from repeating
                            gravity={0.1} // Adjust the gravity to control the speed
                        />
                    </div>
                )}
                {isAlert && (
                    <Alert type={alertMsg.type} className={""}>{alertMsg.message}</Alert>
                )}
                {props.tourData && props.ReportName === 'Templates' && (
                    <>
                        <Tour
                        //@ts-ignore
                            onRequestClose={closeTour}
                            steps={props.tourData}
                            isOpen={isTour}
                            // rounded={5}
                            closeWithMask={false}
                        />
                        {isPublicTour && (
                            <Tour
                                showNumber={false}
                                showNavigation={false}
                                showNavigationNumber={false}
                                onRequestClose={closePublicTour}
                                //@ts-ignore
                                steps={publicTourConfig}
                                isOpen={true}
                                rounded={5}
                                closeWithMask={false}
                            />
                        )}
                    </>
                )}
                <div className="flex flex-row items-center justify-between my-2 mx-3 text-[20px] md:text-[23px]">
                    <div className="font-light">
                        {t(`report-name.${props.ReportName}`)}
                        {props.report_help && (
                            <span className="text-xs md:text-[13px] font-normal">
                                <Tooltip
                                    message={t(
                                        `report-help.${props.ReportName}`
                                    )}
                                />
                            </span>
                        )}
                    </div>
                    {props.ReportName === 'Templates' && (
                        <i
                            data-tut="reactourFirst"
                            onClick={() => router.push('/form/template')}
                            className="fa-light fa-square-plus text-accent text-[40px]"
                        ></i>
                    )}
                    {props.form && (
                        <div
                            className="cursor-pointer"
                            onClick={() => handleContactFormModal()}
                        >
                            <i className="fa-light fa-square-plus text-accent text-[40px]"></i>
                        </div>
                    )}
                </div>
                <div
                    className={`overflow-auto w-full border-b ${
                        props.List?.length > 0
                            ? isDashboard
                                ? 'min-h-[317px]'
                                : currentList?.length === props.docPerPage
                                  ? 'h-fit'
                                  : 'h-screen'
                            : ''
                    }`}
                >
                    <table className="op-table border-collapse w-full mb-4">
                        <thead className="text-[14px] text-center">
                            <tr className="border-y-[1px]">
                                {props.heading?.map((item, index) => (
                                    <React.Fragment key={index}>
                                        <th className="p-2">
                                            {t(`report-heading.${item}`)}
                                        </th>
                                    </React.Fragment>
                                ))}
                                {props.ReportName === 'Templates' &&
                                    isEnableSubscription && (
                                        <th className="p-2">{t('public')}</th>
                                    )}
                                {props.actions?.length > 0 && (
                                    <th className="p-2 text-transparent pointer-events-none">
                                        {t('action')}
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="text-[12px]">
                            {props.List?.length > 0 && (
                                <>
                                    {currentList.map((item, index) =>
                                        props.ReportName === 'Contactbook' ? (
                                            <tr
                                                className="border-y-[1px]"
                                                key={index}
                                            >
                                                {props.heading.includes(
                                                    'Sr.No'
                                                ) && (
                                                    <th className="p-2">
                                                        {startIndex + index + 1}
                                                    </th>
                                                )}
                                                <td className="px-4 py-2 font-semibold">
                                                    {item?.Name}{' '}
                                                </td>
                                                <td className="p-2 text-center">
                                                    {item?.Email || '-'}
                                                </td>
                                                <td className="p-2 text-center">
                                                    {item?.Phone || '-'}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="text-base-content min-w-max flex flex-row gap-x-2 gap-y-1 justify-start items-center">
                                                        {props.actions?.length >
                                                            0 &&
                                                            props.actions.map(
                                                                (
                                                                    act,
                                                                    index
                                                                ) => (
                                                                    <button
                                                                        key={
                                                                            index
                                                                        }
                                                                        onClick={() =>
                                                                            handleActionBtn(
                                                                                act,
                                                                                item
                                                                            )
                                                                        }
                                                                        title={t(
                                                                            `btnLabel.${act.hoverLabel}`
                                                                        )}
                                                                        className={`${
                                                                            act?.btnColor
                                                                                ? act.btnColor
                                                                                : ''
                                                                        } op-btn op-btn-sm`}
                                                                    >
                                                                        <i
                                                                            className={
                                                                                act.btnIcon
                                                                            }
                                                                        ></i>
                                                                    </button>
                                                                )
                                                            )}
                                                        {isDeleteModal[
                                                            item.objectId
                                                        ] && (
                                                            <ModalUi
                                                                isOpen
                                                                title={
                                                                    'Delete Contact'
                                                                }
                                                                handleClose={
                                                                    handleClose
                                                                }
                                                                reduceWidth={true} 
                                                            >
                                                                <div className="m-[20px]">
                                                                    <div className="text-lg font-normal text-black">
                                                                        {t(
                                                                            'contact-delete-alert'
                                                                        )}
                                                                    </div>
                                                                    <hr className="bg-[#ccc] mt-4 " />
                                                                    <div className="flex items-center mt-3 gap-2 text-white">
                                                                        <button
                                                                            onClick={() =>
                                                                                handleDelete(
                                                                                    item
                                                                                )
                                                                            }
                                                                            className="op-btn op-btn-primary"
                                                                        >
                                                                            {t(
                                                                                'yes'
                                                                            )}
                                                                        </button>
                                                                        <button
                                                                            onClick={
                                                                                handleClose
                                                                            }
                                                                            className="op-btn op-btn-secondary"
                                                                        >
                                                                            {t(
                                                                                'no'
                                                                            )}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </ModalUi>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            <tr
                                                className={`${
                                                    currentList?.length ===
                                                    props.docPerPage
                                                        ? 'last:border-none'
                                                        : ''
                                                } border-y-[1px] `}
                                                key={index}
                                            >
                                                {props.heading.includes(
                                                    'Sr.No'
                                                ) && (
                                                    <th className="px-2 py-2">
                                                        {startIndex + index + 1}
                                                    </th>
                                                )}
                                                <td className="p-2 min-w-56 max-w-56 flex flex-col">
                                                    <div className="font-semibold">
                                                        {item?.Name}
                                                    </div>
                                                    {item?.ExpiryDate?.iso && (
                                                        <div className="text-gray-500">
                                                            Expire:{' '}
                                                            {formatDate(
                                                                item?.ExpiryDate
                                                                    ?.iso
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                                {props?.heading?.includes(
                                                    'Reason'
                                                ) && (
                                                    <td className="p-2 text-center">
                                                        {item?.DeclineReason
                                                            ?.length > 25
                                                            ? item?.DeclineReason?.slice(
                                                                  0,
                                                                  25
                                                              ) + '...'
                                                            : item?.DeclineReason ||
                                                              '-'}
                                                    </td>
                                                )}
                                                {props.heading.includes(
                                                    'Note'
                                                ) && (
                                                    <td className="p-2 text-center">
                                                        <p className="truncate w-[100px]">
                                                            {item?.Note || '-'}
                                                        </p>
                                                    </td>
                                                )}
                                                {props.heading.includes(
                                                    'Folder'
                                                ) && (
                                                    <td className="p-2 text-center">
                                                        {item?.Folder?.Name ||
                                                            t(
                                                                'sidebar.EducationCa™ Drive'
                                                            )}
                                                    </td>
                                                )}
                                                <td className="p-2 text-center">
                                                    <button
                                                        onClick={() =>
                                                            handleDownload(item)
                                                        }
                                                        className="op-link op-link-primary"
                                                        title={t('download')}
                                                    >
                                                        {item?.URL
                                                            ? t('download')
                                                            : '-'}
                                                    </button>
                                                </td>
                                                {props.heading.includes(
                                                    'Owner'
                                                ) && (
                                                    <td className="p-2 text-center">
                                                        {formatRow(
                                                            item?.ExtUserPtr
                                                        )}
                                                    </td>
                                                )}
                                                {props.heading.includes(
                                                    'Signers'
                                                ) &&
                                                [
                                                    'In-progress documents',
                                                    'Need your sign',
                                                ].includes(props.ReportName) ? (
                                                    <td className="px-1 py-2">
                                                        {!item?.IsSignyourself &&
                                                            item?.Placeholders && (
                                                                <>
                                                                    {formatStatusRow(
                                                                        item
                                                                    )}
                                                                </>
                                                            )}
                                                    </td>
                                                ) : (
                                                    <td className="p-2 text-center">
                                                        {!item?.IsSignyourself &&
                                                        item?.Placeholders ? (
                                                            <button
                                                                onClick={() =>
                                                                    handleViewSigners(
                                                                        item
                                                                    )
                                                                }
                                                                className="op-link op-link-primary"
                                                            >
                                                                {t('view')}
                                                            </button>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </td>
                                                )}
                                                {props.ReportName ===
                                                    'Templates' &&
                                                    isEnableSubscription && (
                                                        <td className=" pl-[20px] py-2">
                                                            {props.ReportName ===
                                                                'Templates' && (
                                                                <div
                                                                    className="flex flex-row"
                                                                    data-tut="IsPublic"
                                                                >
                                                                    <label className="cursor-pointer relative inline-flex items-center mb-0">
                                                                        <input
                                                                            checked={
                                                                                props
                                                                                    .isPublic?.[
                                                                                    item
                                                                                        .objectId
                                                                                ]
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) => {
                                                                                setIsPublicTour("");
                                                                                handlePublicChange(
                                                                                    e,
                                                                                    item
                                                                                );
                                                                            }}
                                                                            type="checkbox"
                                                                            value=""
                                                                            className="sr-only peer"
                                                                        />
                                                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-black rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-black peer-checked:bg-blue-600"></div>
                                                                    </label>
                                                                </div>
                                                            )}
                                                            {isMakePublicModal[
                                                                item.objectId
                                                            ] && (
                                                                <ModalUi
                                                                    isOpen
                                                                    title={
                                                                        props
                                                                            .isPublic[
                                                                            item
                                                                                .objectId
                                                                        ]
                                                                            ? t(
                                                                                  'make-template-public'
                                                                              )
                                                                            : t(
                                                                                  'make-template-private'
                                                                              )
                                                                    }
                                                                    handleClose={() => {
                                                                        setIsMakePublicModal(
                                                                            {}
                                                                        );
                                                                        setSelectedPublicRole(
                                                                            ''
                                                                        );
                                                                        props.setIsPublic(
                                                                            (
                                                                                prevStates
                                                                            ) => ({
                                                                                ...prevStates,
                                                                                [item.objectId]:
                                                                                    !prevStates[
                                                                                        item
                                                                                            .objectId
                                                                                    ],
                                                                            })
                                                                        );
                                                                    }}
                                                                    reduceWidth={true} 
                                                                >
                                                                    <div className="m-[20px]">
                                                                        <div className="font-normal text-black">
                                                                            <p className="text-lg">
                                                                                {props
                                                                                    .isPublic[
                                                                                    item
                                                                                        .objectId
                                                                                ]
                                                                                    ? t(
                                                                                          'make-template-public-alert'
                                                                                      )
                                                                                    : t(
                                                                                          'make-template-private-alert'
                                                                                      )}
                                                                            </p>
                                                                            {props
                                                                                .isPublic[
                                                                                item
                                                                                    .objectId
                                                                            ] && (
                                                                                <div className="flex mt-2 gap-2 md:items-center">
                                                                                    <p className="text-[15px]">
                                                                                        {t(
                                                                                            'public-role'
                                                                                        )}{' '}
                                                                                        :{' '}
                                                                                    </p>

                                                                                    <input
                                                                                        className="op-input op-input-bordered focus:outline-none hover:border-base-content op-input-sm"
                                                                                        value={handleShowRole(
                                                                                            item
                                                                                        )}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <hr className="bg-[#ccc] mt-2 " />
                                                                        <div className="flex items-center mt-3 gap-2 text-white">
                                                                            <button
                                                                                onClick={() =>
                                                                                    handlePublicTemplate(
                                                                                        item
                                                                                    )
                                                                                }
                                                                                className="op-btn op-btn-primary"
                                                                            >
                                                                                {t(
                                                                                    'yes'
                                                                                )}
                                                                            </button>
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleClose(
                                                                                        item
                                                                                    )
                                                                                }
                                                                                className="op-btn op-btn-secondary"
                                                                            >
                                                                                {t(
                                                                                    'no'
                                                                                )}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </ModalUi>
                                                            )}
                                                            {isPublicProfile[
                                                                item.objectId
                                                            ] && (
                                                                <ModalUi
                                                                    isOpen
                                                                    title={t(
                                                                        'public-url'
                                                                    )}
                                                                    handleClose={() => {
                                                                        setIsPublicProfile(
                                                                            {}
                                                                        );
                                                                        setIsEmbed(
                                                                            false
                                                                        );
                                                                    }}
                                                                    reduceWidth={true} 
                                                                >
                                                                    <div className="m-[20px]">
                                                                        {isEmbed &&
                                                                        !item?.IsPublic ? (
                                                                            <>
                                                                                <p>
                                                                                    {t(
                                                                                        'public-template-mssg-6'
                                                                                    )}
                                                                                </p>
                                                                                <EmbedTab
                                                                                    templateId={
                                                                                        item.objectId
                                                                                    }
                                                                                />
                                                                            </>
                                                                        ) : publicUserName ? (
                                                                            <div className="font-normal text-black">
                                                                                <span>
                                                                                    {t(
                                                                                        'public-url-copy'
                                                                                    )}
                                                                                </span>
                                                                                <div className=" flex items-center justify-between gap-3 p-[2px] ">
                                                                                    <div className="w-[280px] whitespace-nowrap overflow-hidden text-ellipsis">
                                                                                        <a
                                                                                            rel="noreferrer"
                                                                                            target="_blank"
                                                                                            href={publicUrl()}
                                                                                            className="ml-[2px] underline underline-offset-2 cursor-pointer text-blue-800"
                                                                                        >
                                                                                            {publicUrl()}
                                                                                        </a>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <RWebShare
                                                                                            data={{
                                                                                                url: publicUrl(),
                                                                                                title: 'Public url',
                                                                                            }}
                                                                                        >
                                                                                            <button className="op-btn op-btn-primary op-btn-outline op-btn-xs md:op-btn-sm ">
                                                                                                <i className="fa-light fa-share-from-square"></i>{' '}
                                                                                                <span className="hidden md:inline-block">
                                                                                                    {t(
                                                                                                        'btnLabel.Share'
                                                                                                    )}
                                                                                                </span>
                                                                                            </button>
                                                                                        </RWebShare>
                                                                                        <button
                                                                                            className="op-btn op-btn-primary op-btn-outline op-btn-xs md:op-btn-sm md:w-[100px]"
                                                                                            onClick={() =>
                                                                                                copytoProfileLink()
                                                                                            }
                                                                                        >
                                                                                            <i className="fa-light fa-copy" />
                                                                                            <span className="hidden md:inline-block">
                                                                                                {copied[
                                                                                                    'publicprofile'
                                                                                                ]
                                                                                                    ? t(
                                                                                                          'copied'
                                                                                                      )
                                                                                                    : t(
                                                                                                          'copy'
                                                                                                      )}
                                                                                            </span>
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                                <p className="text-[13px] mt-[5px]">
                                                                                    {t(
                                                                                        'public-url-copy-mssg'
                                                                                    )}
                                                                                </p>
                                                                                <EmbedTab
                                                                                    templateId={
                                                                                        item.objectId
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <div className="font-normal text-black">
                                                                                <p>
                                                                                    {t(
                                                                                        'add-public-url-alert'
                                                                                    )}
                                                                                </p>
                                                                                <button
                                                                                    className="mt-3 op-btn op-btn-primary"
                                                                                    onClick={() =>
                                                                                        router.push(
                                                                                            '/profile'
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    {t(
                                                                                        'Proceed'
                                                                                    )}
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </ModalUi>
                                                            )}
                                                        </td>
                                                    )}
                                                <td className="px-2 py-2">
                                                    <div className="text-base-content min-w-max flex flex-row gap-x-2 gap-y-1 justify-start items-center">
                                                        {props.actions?.length >
                                                            0 &&
                                                            props.actions.map(
                                                                (act, index) =>
                                                                    props.ReportName ===
                                                                    'Templates' ? (
                                                                        <React.Fragment
                                                                            key={
                                                                                index
                                                                            }
                                                                        >
                                                                            {(item
                                                                                .ExtUserPtr
                                                                                ?.objectId ===
                                                                                extClass?.[0]
                                                                                    ?.objectId ||
                                                                                act.btnLabel ===
                                                                                    'Use') && (
                                                                                <div
                                                                                    role="button"
                                                                                    data-tut={
                                                                                        act?.selector
                                                                                    }
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                    onClick={() =>
                                                                                        handleActionBtn(
                                                                                            act,
                                                                                            item
                                                                                        )
                                                                                    }
                                                                                    title={t(
                                                                                        `btnLabel.${act.hoverLabel}`
                                                                                    )}
                                                                                    className={
                                                                                        act.action !==
                                                                                        'option'
                                                                                            ? `${
                                                                                                  act?.btnColor ||
                                                                                                  ''
                                                                                              } op-btn op-btn-sm mr-1`
                                                                                            : 'text-base-content focus:outline-none text-lg mr-2 relative'
                                                                                    }
                                                                                >
                                                                                    <i
                                                                                        className={
                                                                                            act.btnIcon
                                                                                        }
                                                                                    ></i>
                                                                                    {act.btnLabel && (
                                                                                        <span className="uppercase font-medium">
                                                                                            {act.btnLabel.includes(
                                                                                                'Quick send'
                                                                                            ) &&
                                                                                            isEnableSubscription
                                                                                                ? 'Bulk Send'
                                                                                                : `${t(
                                                                                                      `btnLabel.${act.btnLabel}`
                                                                                                  )}`}
                                                                                        </span>
                                                                                    )}
                                                                                    {/* template report */}
                                                                                    {isOption[
                                                                                        item
                                                                                            .objectId
                                                                                    ] &&
                                                                                        act.action ===
                                                                                            'option' && (
                                                                                            <ul className="absolute -right-1 top-auto z-[70] w-max op-dropdown-content op-menu shadow-black/20 shadow bg-base-100 text-base-content rounded-box">
                                                                                                {act.subaction?.map(
                                                                                                    (
                                                                                                        subact
                                                                                                    ) => (
                                                                                                        <li
                                                                                                            key={
                                                                                                                subact.btnId
                                                                                                            }
                                                                                                            onClick={() =>
                                                                                                                handleActionBtn(
                                                                                                                    subact,
                                                                                                                    item
                                                                                                                )
                                                                                                            }
                                                                                                            title={t(
                                                                                                                `btnLabel.${subact.btnLabel}`
                                                                                                            )}
                                                                                                        >
                                                                                                            <span>
                                                                                                                <i
                                                                                                                    className={`${subact.btnIcon} mr-1.5`}
                                                                                                                ></i>
                                                                                                                {subact.btnLabel && (
                                                                                                                    <span className="text-[13px] capitalize font-medium">
                                                                                                                        {t(
                                                                                                                            `btnLabel.${subact.btnLabel}`
                                                                                                                        )}
                                                                                                                    </span>
                                                                                                                )}
                                                                                                            </span>
                                                                                                        </li>
                                                                                                    )
                                                                                                )}
                                                                                            </ul>
                                                                                        )}
                                                                                </div>
                                                                            )}
                                                                        </React.Fragment>
                                                                    ) : (
                                                                        <div
                                                                            role="button"
                                                                            data-tut={
                                                                                act?.selector
                                                                            }
                                                                            key={
                                                                                index
                                                                            }
                                                                            onClick={() =>
                                                                                handleActionBtn(
                                                                                    act,
                                                                                    item
                                                                                )
                                                                            }
                                                                            title={t(
                                                                                `btnLabel.${act.hoverLabel}`
                                                                            )}
                                                                            className={
                                                                                act.action !==
                                                                                'option'
                                                                                    ? `${
                                                                                          act?.btnColor
                                                                                              ? act.btnColor
                                                                                              : ''
                                                                                      } op-btn op-btn-sm mr-1`
                                                                                    : 'text-base-content focus:outline-none text-lg mr-2 relative'
                                                                            }
                                                                        >
                                                                            <i
                                                                                className={
                                                                                    act.btnIcon
                                                                                }
                                                                            ></i>
                                                                            {act.btnLabel && (
                                                                                <span className="uppercase font-medium">
                                                                                    {t(
                                                                                        `btnLabel.${act.btnLabel}`
                                                                                    )}
                                                                                </span>
                                                                            )}
                                                                            {/* doc report */}
                                                                            {isOption[
                                                                                item
                                                                                    .objectId
                                                                            ] &&
                                                                                act.action ===
                                                                                    'option' && (
                                                                                    <ul className="absolute -right-1 top-auto z-[70] w-max op-dropdown-content op-menu shadow-black/20 shadow bg-base-100 text-base-content rounded-box">
                                                                                        {act.subaction?.map(
                                                                                            (
                                                                                                subact
                                                                                            ) => (
                                                                                                <li
                                                                                                    key={
                                                                                                        subact.btnId
                                                                                                    }
                                                                                                    onClick={() =>
                                                                                                        handleActionBtn(
                                                                                                            subact,
                                                                                                            item
                                                                                                        )
                                                                                                    }
                                                                                                    title={t(
                                                                                                        `btnLabel.${subact.hoverLabel}`
                                                                                                    )}
                                                                                                >
                                                                                                    <span>
                                                                                                        <i
                                                                                                            className={`${subact.btnIcon} mr-1.5`}
                                                                                                        ></i>
                                                                                                        {subact.btnLabel && (
                                                                                                            <span className="text-[13px] capitalize font-medium">
                                                                                                                {t(
                                                                                                                    `btnLabel.${subact.btnLabel}`
                                                                                                                )}
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </span>
                                                                                                </li>
                                                                                            )
                                                                                        )}
                                                                                    </ul>
                                                                                )}
                                                                        </div>
                                                                    )
                                                            )}
                                                    </div>
                                                    {isModal[
                                                        'extendexpiry_' +
                                                            item.objectId
                                                    ] && (
                                                        <ModalUi
                                                            isOpen
                                                            title={t(
                                                                'btnLabel.extend-expiry-date'
                                                            )}
                                                            reduceWidth={
                                                                'md:max-w-[450px]'
                                                            }
                                                            handleClose={() =>
                                                                setIsModal({})
                                                            }
                                                        >
                                                            <form
                                                                className="px-4 py-2 flex flex-col"
                                                                onSubmit={(e) =>
                                                                    handleUpdateExpiry(
                                                                        e,
                                                                        item
                                                                    )
                                                                }
                                                            >
                                                                <label className="mr-2">
                                                                    {t(
                                                                        'expiry-date'
                                                                    )}{' '}
                                                                    {
                                                                        '(dd-mm-yyyy)'
                                                                    }
                                                                </label>
                                                                <input
                                                                    type="date"
                                                                    className="rounded-full mb-2 bg-base-300 w-full px-4 py-2 text-black border-2 hover:border-spacing-2"
                                                                    defaultValue={
                                                                        item?.ExpiryDate?.iso?.split(
                                                                            'T'
                                                                        )?.[0]
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        setExpiryDate(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        );
                                                                    }}
                                                                />
                                                                <div className="flex justify-start mb-1">
                                                                    <button
                                                                        type="submit"
                                                                        className="op-btn op-btn-primary"
                                                                    >
                                                                        {t(
                                                                            'update'
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </form>
                                                        </ModalUi>
                                                    )}
                                                    {isShareWith[
                                                        item.objectId
                                                    ] && (
                                                        <div className="op-modal op-modal-open">
                                                            <div className="max-h-90 bg-base-100 w-[95%] md:max-w-[500px] rounded-box relative">
                                                                {validplan[
                                                                    isSubscribe
                                                                        .plan
                                                                ] &&
                                                                    isEnableSubscription && (
                                                                        <>
                                                                            {item
                                                                                ?.Signers
                                                                                ?.length >
                                                                            0 ? (
                                                                                <div className="h-[150px] flex justify-center items-center mx-2">
                                                                                    <div
                                                                                        className="op-btn op-btn-sm op-btn-circle op-btn-ghost text-base-content absolute right-2 top-2 z-40"
                                                                                        onClick={() =>
                                                                                            setIsShareWith(
                                                                                                {}
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        ✕
                                                                                    </div>
                                                                                    <div className="text-base-content text-base text-center">
                                                                                        {t(
                                                                                            'share-with-alert'
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <>
                                                                                    <h3 className="text-base-content font-bold text-lg pt-[15px] px-[20px]">
                                                                                        {t(
                                                                                            'share-with'
                                                                                        )}
                                                                                    </h3>
                                                                                    <div
                                                                                        className="op-btn op-btn-sm op-btn-circle op-btn-ghost text-base-content absolute right-2 top-2 z-40"
                                                                                        onClick={() =>
                                                                                            setIsShareWith(
                                                                                                {}
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        ✕
                                                                                    </div>
                                                                                    <form
                                                                                        className="h-full w-full z-[1300] px-2 mt-3"
                                                                                        onSubmit={(
                                                                                            e
                                                                                        ) =>
                                                                                            handleShareWith(
                                                                                                e,
                                                                                                item
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <Select
                                                                                            // onSortEnd={onSortEnd}
                                                                                            //@ts-ignore
                                                                                            distance={
                                                                                                4
                                                                                            }
                                                                                            isMulti
                                                                                            options={
                                                                                                teamList
                                                                                            }
                                                                                            value={
                                                                                                selectedTeam
                                                                                            }
                                                                                            onChange={
                                                                                                onChange
                                                                                            }
                                                                                            closeMenuOnSelect
                                                                                            required={
                                                                                                true
                                                                                            }
                                                                                            noOptionsMessage={() =>
                                                                                                t(
                                                                                                    'team-not-found'
                                                                                                )
                                                                                            }
                                                                                            unstyled
                                                                                            classNames={{
                                                                                                control:
                                                                                                    () =>
                                                                                                        'op-input op-input-bordered op-input-sm border-gray-400 focus:outline-none hover:border-base-content w-full h-full text-[11px]',
                                                                                                valueContainer:
                                                                                                    () =>
                                                                                                        'flex flex-row gap-x-[2px] gap-y-[2px] md:gap-y-0 w-full my-[2px]',
                                                                                                multiValue:
                                                                                                    () =>
                                                                                                        'op-badge op-badge-primary h-full text-[11px]',
                                                                                                multiValueLabel:
                                                                                                    () =>
                                                                                                        'mb-[2px]',
                                                                                                menu: () =>
                                                                                                    'mt-1 shadow-md rounded-lg bg-base-200 text-base-content',
                                                                                                menuList:
                                                                                                    () =>
                                                                                                        'shadow-md rounded-lg overflow-hidden',
                                                                                                option: () =>
                                                                                                    'bg-base-200 text-base-content rounded-lg m-1 hover:bg-base-300 p-2',
                                                                                                noOptionsMessage:
                                                                                                    () =>
                                                                                                        'p-2 bg-base-200 rounded-lg m-1 p-2',
                                                                                            }}
                                                                                        />
                                                                                        <button className="op-btn op-btn-primary ml-[10px] my-3">
                                                                                            {t(
                                                                                                'submit'
                                                                                            )}
                                                                                        </button>
                                                                                    </form>
                                                                                </>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                {isEnableSubscription &&
                                                                    !validplan[
                                                                        isSubscribe
                                                                            .plan
                                                                    ] && (
                                                                        <>
                                                                            <div
                                                                                className="op-btn op-btn-sm op-btn-circle op-btn-ghost text-primary-content absolute right-2 top-2 z-40"
                                                                                onClick={() =>
                                                                                    setIsShareWith(
                                                                                        {}
                                                                                    )
                                                                                }
                                                                            >
                                                                                ✕
                                                                            </div>
                                                                            <SubscribeCard plan="TEAMS" price={0}/>
                                                                        </>
                                                                    )}
                                                                {!isEnableSubscription &&
                                                                    validplan[
                                                                        isSubscribe
                                                                            .plan
                                                                    ] && (
                                                                        <>
                                                                            <h3 className="text-base-content font-bold text-lg pt-[15px] px-[20px]">
                                                                                {t(
                                                                                    'share-with'
                                                                                )}
                                                                            </h3>
                                                                            <div
                                                                                className="op-btn op-btn-sm op-btn-circle op-btn-ghost text-base-content absolute right-2 top-2 z-40"
                                                                                onClick={() =>
                                                                                    setIsShareWith(
                                                                                        {}
                                                                                    )
                                                                                }
                                                                            >
                                                                                ✕
                                                                            </div>
                                                                            <div className="px-2 mt-3 w-full h-full">
                                                                                <div className="op-input op-input-bordered op-input-sm w-full h-full text-[13px] break-all">
                                                                                    {
                                                                                        selectedTeam?.[0]
                                                                                            ?.label
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                            <button
                                                                                onClick={(
                                                                                    e
                                                                                ) =>
                                                                                    handleShareWith(
                                                                                        e,
                                                                                        item
                                                                                    )
                                                                                }
                                                                                className="op-btn op-btn-primary ml-[10px] my-3"
                                                                            >
                                                                                {t(
                                                                                    'submit'
                                                                                )}
                                                                            </button>
                                                                        </>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {isViewShare[
                                                        item.objectId
                                                    ] && (
                                                        <ModalUi
                                                            isOpen
                                                            showHeader={
                                                                props.ReportName ===
                                                                    'Templates' &&
                                                                true
                                                            }
                                                            title={t('signers')}
                                                            reduceWidth={
                                                                'md:max-w-[450px]'
                                                            }
                                                            handleClose={() =>
                                                                setIsViewShare(
                                                                    {}
                                                                )
                                                            }
                                                        >
                                                            {props.ReportName !==
                                                                'Templates' && (
                                                                <div
                                                                    className="op-btn op-btn-sm op-btn-circle op-btn-ghost text-base-content absolute right-2 top-1 z-40"
                                                                    onClick={() =>
                                                                        setIsViewShare(
                                                                            {}
                                                                        )
                                                                    }
                                                                >
                                                                    ✕
                                                                </div>
                                                            )}
                                                            <table className="op-table w-full overflow-auto">
                                                                <thead className="h-[38px] sticky top-0 text-base-content text-sm pt-[15px] px-[20px]">
                                                                    <tr>
                                                                        {props.ReportName ===
                                                                            'Templates' && (
                                                                            <th className="p-2 pl-3 w-[30%]">
                                                                                {t(
                                                                                    'roles'
                                                                                )}
                                                                            </th>
                                                                        )}
                                                                        <th className="pl-3 py-2">
                                                                            {props.ReportName ===
                                                                            'Templates'
                                                                                ? t(
                                                                                      'email'
                                                                                  )
                                                                                : t(
                                                                                      'signers'
                                                                                  )}
                                                                        </th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {item.Placeholders.map(
                                                                        (
                                                                            x,
                                                                            i
                                                                        ) =>
                                                                            x.Role !==
                                                                                'prefill' && (
                                                                                <tr
                                                                                    key={
                                                                                        i
                                                                                    }
                                                                                    className="text-sm font-medium"
                                                                                >
                                                                                    {props.ReportName ===
                                                                                        'Templates' && (
                                                                                        <td className="text-[12px] p-2 pl-3 w-[30%]">
                                                                                            {x.Role &&
                                                                                                x.Role}
                                                                                        </td>
                                                                                    )}
                                                                                    <td className="pl-3 text-[12px] py-2 break-all">
                                                                                        {x.email
                                                                                            ? x.email
                                                                                            : x
                                                                                                  ?.signerPtr
                                                                                                  ?.Email ||
                                                                                              '-'}
                                                                                    </td>
                                                                                </tr>
                                                                            )
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </ModalUi>
                                                    )}
                                                    {isDeleteModal[
                                                        item.objectId
                                                    ] && (
                                                        <ModalUi
                                                            isOpen
                                                            title={t(
                                                                'delete-document'
                                                            )}
                                                            handleClose={
                                                                handleClose
                                                            }
                                                            reduceWidth={true} 
                                                        >
                                                            <div className="m-[20px]">
                                                                <div className="text-lg font-normal text-black">
                                                                    {t(
                                                                        'delete-document-alert'
                                                                    )}
                                                                </div>
                                                                <hr className="bg-[#ccc] mt-4" />
                                                                <div className="flex items-center mt-3 gap-2 text-white">
                                                                    <button
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                item
                                                                            )
                                                                        }
                                                                        className="op-btn op-btn-primary"
                                                                    >
                                                                        {t(
                                                                            'yes'
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        onClick={
                                                                            handleClose
                                                                        }
                                                                        className="op-btn op-btn-secondary"
                                                                    >
                                                                        {t(
                                                                            'no'
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </ModalUi>
                                                    )}
                                                    {isBulkSend[
                                                        item.objectId
                                                    ] && (
                                                        <ModalUi
                                                            isOpen
                                                            title={
                                                                isEnableSubscription
                                                                    ? 'Bulk send'
                                                                    : t(
                                                                          'quick-send'
                                                                      )
                                                            }
                                                            handleClose={() =>
                                                                setIsBulkSend(
                                                                    {}
                                                                )
                                                            }
                                                            reduceWidth={true} 
                                                        >
                                                            {isLoader[
                                                                item.objectId
                                                            ] ? (
                                                                <div className="w-full h-[100px] flex justify-center items-center z-30">
                                                                    <Loader />
                                                                </div>
                                                            ) : (
                                                                <BulkSendUi
                                                                    Placeholders={
                                                                        placeholders
                                                                    }
                                                                    item={
                                                                        templateDeatils
                                                                    }
                                                                    handleClose={
                                                                        handleQuickSendClose
                                                                    }
                                                                    signatureType={
                                                                        signatureType
                                                                    }
                                                                />
                                                            )}
                                                        </ModalUi>
                                                    )}
                                                    {isShare[item.objectId] && (
                                                        <ModalUi
                                                            isOpen
                                                            title={t(
                                                                'copy-link'
                                                            )}
                                                            handleClose={() => {
                                                                setIsShare({});
                                                                setActLoader(
                                                                    {}
                                                                );
                                                                setCopied(
                                                                    false
                                                                );
                                                            }}
                                                            reduceWidth={true} 
                                                        >
                                                            <div className="m-[20px]">
                                                                {shareUrls.map(
                                                                    (
                                                                        share:any,
                                                                        i
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                i
                                                                            }
                                                                            className="text-sm font-normal text-black flex my-2 justify-between items-center"
                                                                        >
                                                                            <span className="w-[150px] mr-[5px] md:mr-0 md:w-[300px] whitespace-nowrap overflow-hidden text-ellipsis text-sm font-semibold">
                                                                                {
                                                                                    share.email
                                                                                }
                                                                            </span>
                                                                            <div className="flex items-center gap-2">
                                                                                <RWebShare
                                                                                    data={{
                                                                                        url: share.url,
                                                                                        title: 'Sign url',
                                                                                    }}
                                                                                >
                                                                                    <button className="op-btn op-btn-primary op-btn-outline op-btn-xs md:op-btn-sm ">
                                                                                        <i className="fa-light fa-share-from-square"></i>{' '}
                                                                                        {t(
                                                                                            'btnLabel.Share'
                                                                                        )}
                                                                                    </button>
                                                                                </RWebShare>
                                                                                <button
                                                                                    className="op-btn op-btn-primary op-btn-outline op-btn-xs md:op-btn-sm"
                                                                                    onClick={() =>
                                                                                        copytoclipboard(
                                                                                            share
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <i className="fa-light fa-copy" />
                                                                                    {copied[
                                                                                        share
                                                                                            .email
                                                                                    ]
                                                                                        ? t(
                                                                                              'copied'
                                                                                          )
                                                                                        : t(
                                                                                              'copy'
                                                                                          )}
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        </ModalUi>
                                                    )}
                                                    {isRevoke[
                                                        item.objectId
                                                    ] && (
                                                        <ModalUi
                                                            isOpen
                                                            title={t(
                                                                'revoke-document'
                                                            )}
                                                            handleClose={
                                                                handleClose
                                                            }
                                                            reduceWidth={true} 
                                                        >
                                                            <div className="m-[20px]">
                                                                <div className="text-sm md:text-lg font-normal text-black">
                                                                    {t(
                                                                        'revoke-document-alert'
                                                                    )}
                                                                </div>
                                                                <div className="mt-2">
                                                                    <textarea
                                                                        rows={3}
                                                                        placeholder="Reason (optional)"
                                                                        className="px-4 op-textarea op-textarea-bordered focus:outline-none hover:border-base-content w-full text-xs"
                                                                        value={
                                                                            reason
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            setReason(
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                    ></textarea>
                                                                </div>
                                                                <div className="flex items-center mt-3 gap-2">
                                                                    <button
                                                                        onClick={() =>
                                                                            handleRevoke(
                                                                                item
                                                                            )
                                                                        }
                                                                        className="op-btn op-btn-primary px-6"
                                                                    >
                                                                        {t(
                                                                            'yes'
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        onClick={
                                                                            handleClose
                                                                        }
                                                                        className="op-btn op-btn-secondary px-6"
                                                                    >
                                                                        {t(
                                                                            'no'
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </ModalUi>
                                                    )}
                                                    {isResendMail[
                                                        item.objectId
                                                    ] && (
                                                        <ModalUi
                                                            isOpen
                                                            title={t(
                                                                'resend-mail'
                                                            )}
                                                            handleClose={() => {
                                                                setIsResendMail(
                                                                    {}
                                                                );
                                                                setIsNextStep(
                                                                    {}
                                                                );
                                                                setUserDetails(
                                                                    {}
                                                                );
                                                            }}
                                                            reduceWidth={true} 
                                                        >
                                                            <div className=" overflow-y-auto max-h-[340px] md:max-h-[400px]">
                                                                {item?.Placeholders?.map(
                                                                    (user) => (
                                                                        <React.Fragment
                                                                            key={
                                                                                user.Id
                                                                            }
                                                                        >
                                                                            {isNextStep[
                                                                                user
                                                                                    .Id
                                                                            ] && (
                                                                                <div className="relative ">
                                                                                    {actLoader[
                                                                                        user
                                                                                            .Id
                                                                                    ] && (
                                                                                        <div className="absolute w-full h-full flex justify-center items-center bg-black bg-opacity-30 z-30">
                                                                                            <Loader />
                                                                                        </div>
                                                                                    )}
                                                                                    <form
                                                                                        onSubmit={(
                                                                                            e
                                                                                        ) =>
                                                                                            handleResendMail(
                                                                                                e,
                                                                                                item,
                                                                                                user
                                                                                            )
                                                                                        }
                                                                                        className="w-full flex flex-col gap-2 p-3 text-base-content relative"
                                                                                    >
                                                                                        <div className="absolute right-5 text-xs z-40">
                                                                                            <Tooltip
                                                                                                id={`${user.Id}_help`}
                                                                                                message={t(
                                                                                                    'resend-mail-help'
                                                                                                )}
                                                                                            />
                                                                                        </div>
                                                                                        <div>
                                                                                            <label
                                                                                                className="text-xs ml-1"
                                                                                                htmlFor="mailsubject"
                                                                                            >
                                                                                                {t(
                                                                                                    'subject'
                                                                                                )}{' '}
                                                                                            </label>
                                                                                            <input
                                                                                                id="mailsubject"
                                                                                                className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                                                                                                value={
                                                                                                    mail.subject
                                                                                                }
                                                                                                onChange={(
                                                                                                    e
                                                                                                ) =>
                                                                                                    handleSubjectChange(
                                                                                                        e
                                                                                                            .target
                                                                                                            .value,
                                                                                                        item
                                                                                                    )
                                                                                                }
                                                                                                onInvalid={(
                                                                                                    e
                                                                                                ) =>
                                                                                                    (e.target as HTMLInputElement).setCustomValidity(
                                                                                                        t(
                                                                                                            'input-required'
                                                                                                        )
                                                                                                    )
                                                                                                }
                                                                                                onInput={(
                                                                                                    e
                                                                                                ) =>
                                                                                                    (e.target as HTMLInputElement).setCustomValidity(
                                                                                                        ''
                                                                                                    )
                                                                                                }
                                                                                                required
                                                                                            />
                                                                                        </div>
                                                                                        <div>
                                                                                            <label
                                                                                                className="text-xs ml-1"
                                                                                                htmlFor="mailbody"
                                                                                            >
                                                                                                {t(
                                                                                                    'body'
                                                                                                )}{' '}
                                                                                            </label>
                                                                                            <EditorToolbar containerId="toolbar1" />
                                                                                            <ReactQuill
                                                                                                id="mailbody"
                                                                                                theme="snow"
                                                                                                value={
                                                                                                    mail.body ||
                                                                                                    ''
                                                                                                }
                                                                                                placeholder="add body of email "
                                                                                                modules={
                                                                                                    module1
                                                                                                }
                                                                                                formats={
                                                                                                    formats
                                                                                                }
                                                                                                onChange={(
                                                                                                    value
                                                                                                ) =>
                                                                                                    handlebodyChange(
                                                                                                        value,
                                                                                                        item
                                                                                                    )
                                                                                                }
                                                                                            />
                                                                                        </div>
                                                                                        <button
                                                                                            type="submit"
                                                                                            className="op-btn op-btn-primary"
                                                                                        >
                                                                                            {t(
                                                                                                'resend'
                                                                                            )}
                                                                                        </button>
                                                                                    </form>
                                                                                </div>
                                                                            )}
                                                                            {Object.keys(isNextStep).length <= 0 && (
                                                                                <div className="flex justify-between items-center gap-2 my-2 px-3">
                                                                                    <div className="text-black">
                                                                                        {user
                                                                                            ?.signerPtr
                                                                                            ?.Name ||
                                                                                            '-'}{' '}
                                                                                        {`<${
                                                                                            user?.email
                                                                                                ? user.email
                                                                                                : user
                                                                                                      .signerPtr
                                                                                                      .Email
                                                                                        }>`}
                                                                                    </div>
                                                                                    <>
                                                                                        {fetchUserStatus(
                                                                                            user,
                                                                                            item
                                                                                        )}
                                                                                    </>
                                                                                </div>
                                                                            )}
                                                                        </React.Fragment>
                                                                    )
                                                                )}
                                                            </div>
                                                        </ModalUi>
                                                    )}
                                                    {isDownloadModal[
                                                        item.objectId
                                                    ] && (
                                                        <DownloadPdfZip
                                                            setIsDownloadModal={
                                                                setIsDownloadModal
                                                            }
                                                            isDownloadModal={
                                                                isDownloadModal[
                                                                    item
                                                                        .objectId
                                                                ]
                                                            }
                                                            pdfDetails={[item]}
                                                            isDocId={false}
                                                        />
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </>
                            )}
                        </tbody>
                    </table>
                    {props.List?.length <= 0 && (
                        <div
                            className={`${
                                isDashboard ? 'h-[317px]' : ''
                            } flex flex-col items-center justify-center w-ful bg-base-100 text-base-content rounded-xl py-4`}
                        >
                            <div className="w-[60px] h-[60px] overflow-hidden">
                                <Image
                                    className="w-full h-full object-contain"
                                    src={pad}
                                    alt="img"
                                />
                            </div>
                            <div className="text-sm font-semibold">
                                {t('no-data-avaliable')}
                            </div>
                        </div>
                    )}
                </div>
                <div className="op-join flex flex-wrap items-center p-2">
                    {props.List.length > props.docPerPage && (
                        <button
                            onClick={() => paginateBack()}
                            className="op-join-item op-btn op-btn-sm"
                        >
                            {t('prev')}
                        </button>
                    )}
                    {pageNumbers.map((x, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(x)}
                            disabled={x === '...'}
                            className={`${
                                x === currentPage ? 'op-btn-active' : ''
                            } op-join-item op-btn op-btn-sm`}
                        >
                            {x}
                        </button>
                    ))}
                    {props.List.length > props.docPerPage && (
                        <button
                            onClick={() => paginateFront()}
                            className="op-join-item op-btn op-btn-sm"
                        >
                            {t('next')}
                        </button>
                    )}
                </div>
                <ModalUi
                    title={t('add-contact')}
                    isOpen={isContactform}
                    handleClose={handleContactFormModal}
                    reduceWidth={true} 
                >
                    <AddSigner
                        handleUserData={handleUserData}
                        closePopup={handleContactFormModal}
                    />
                </ModalUi>
            </div>
        </div>
    );
};

export default ReportTable;
