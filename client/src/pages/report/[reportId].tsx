import { OpenSignServerURL, XParseApplicationId } from "@/newComponents/opensigncomponents/constant/Utils";
import reportJson from "@/newComponents/opensigncomponents/json/ReportJson";
import ReportTable from "@/newComponents/opensigncomponents/primitives/GetReportDisplay";
import Loader from "@/newComponents/opensigncomponents/primitives/Loader";
import TourContentWithBtn from "@/newComponents/opensigncomponents/primitives/TourContentWithBtn";
import Title from "@/newComponents/opensigncomponents/Title";
import "@/newComponents/opensigncomponents/parseClient";;
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import OpenSignPageNotFound from "../opensignpages/OpenSignPageNotFound";

const Report = () => {
  if (typeof window === "undefined") {
    return null; 
  }
  const { t } = useTranslation();
//   const { id } = useParams();
  const router = useRouter();
  const [List, setList] = useState<any[]>([]);
  const [isLoader, setIsLoader] = useState(true);
  const [reportName, setReportName] = useState("");
  const [reporthelp, setReportHelp] = useState<any>("");
  const [actions, setActions] = useState<any[]>([]);
  const [heading, setHeading] = useState<any[]>([]);
  const [isNextRecord, setIsNextRecord] = useState(false);
  const [isMoreDocs, setIsMoreDocs] = useState(true);
  const [form, setForm] = useState<any>("");
  const [tourData, setTourData] = useState<any[]>([]);
  const [isDontShow, setIsDontShow] = useState(false);
  const [isPublic, setIsPublic] = useState({});
  const docPerPage = 10;

  const reportId = router.query.reportId; 

  // below useEffect is call when id param change
  useEffect(() => {
    const abortController = new AbortController(); 
    setReportName("");
    setList([]);
    getReportData(abortController);
    // Function returned from useEffect is called on unmount
    return () => {
      setIsLoader(true);
      setList([]);
      setIsNextRecord(false);
      // Here it'll abort the fetch
      abortController.abort();
    };
    // eslint-disable-next-line
  }, [reportId]);

  // below useEffect call when isNextRecord state is true and fetch next record
  useEffect(() => {
    if (isNextRecord) {
      getReportData(null,List.length, 200);
    }
    // eslint-disable-next-line
  }, [isNextRecord]);

  const handleDontShow = (isChecked) => {
    setIsDontShow(isChecked);
  };
  const getReportData = async (abortController:AbortController|null,skipUserRecord = 0, limit = 200) => {
    // setIsLoader(true);

    const json = reportJson(reportId);

    if (json) {
      setActions(json.actions);
      setHeading(json.heading);
      setReportName(json.reportName);
      setForm(json.form);
      setReportHelp(json?.helpMsg);
      const currentUser:any = Parse.User.current()?.id;

      const headers = {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": XParseApplicationId,
        sessiontoken: localStorage.getItem("accesstoken")
      };
      try {
        const params = { reportId: reportId, skip: skipUserRecord, limit: limit };
        const url = `${OpenSignServerURL}/functions/getReport`;

        const res = await axios.post(url, params, {
          headers: headers,
          signal: abortController?.signal // is used to cancel fetch query
        });

        if (reportId === "6TeaPr321t") {
          const tourConfig = [
            {
              selector: "[data-tut=reactourFirst]",
              content: () => (
                <TourContentWithBtn
                  message={t("tour-mssg.report-1")}
                  isChecked={handleDontShow}
                  video={false}
                />
              ),
              position: "top",
              style: { fontSize: "13px" }
            }
          ];

          if (res.data.result && res.data.result?.length > 0) {
            json.actions.map((data) => {
              const newConfig = {
                selector: `[data-tut="${data?.selector}"]`,
                content: () => (
                  <TourContentWithBtn
                    message={t(`tour-mssg.${data?.action}`)}
                    isChecked={handleDontShow}
                    video={false}
                  />
                ),
                position: "top",
                style: { fontSize: "13px" }
              };
              tourConfig.push(newConfig);
            });
          }

          setTourData(tourConfig);
        }
        if (reportId === "4Hhwbp482K") {
          const listData = res.data?.result.filter((x) => x.Signers.length > 0);

          let arr:any[] = [];
          for (const obj of listData) {
            const isSigner = obj.Signers.some(
              (item) => item.UserId.objectId === currentUser
            );
            if (isSigner) {
              let isRecord;
              if (obj?.AuditTrail && obj?.AuditTrail.length > 0) {
                isRecord = obj?.AuditTrail.some(
                  (item) =>
                    item?.UserPtr?.UserId?.objectId === currentUser &&
                    item.Activity === "Signed"
                );
              } else {
                isRecord = false;
              }
              if (isRecord === false) {
                arr.push(obj);
              }
            }
          }
          if (arr.length === docPerPage) {
            setIsMoreDocs(true);
          } else {
            setIsMoreDocs(false);
          }
          setList((prevRecord) =>
            prevRecord.length > 0 ? [...prevRecord, ...arr] : arr
          );
        } else {
          if (res.data.result.length === docPerPage) {
            setIsMoreDocs(true);
          } else {
            setIsMoreDocs(false);
          }
          if (!res.data.result.error) {
            setIsNextRecord(false);
            setList((prevRecord) =>
              prevRecord.length > 0
                ? [...prevRecord, ...res.data.result]
                : res.data.result
            );
            const listData = res.data.result;
            setIsPublic(
              listData.reduce((acc, item) => {
                acc[item.objectId] = item?.IsPublic || false;
                return acc;
              }, {})
            );
          }
        }
        setIsLoader(false);
      } catch (err:any) {
        console.log("getReportData err  .........:",err);
        const isCancel = axios.isCancel(err);
        console.log("getReportData err  isCancel..........:");
        if (!isCancel) {
          console.log("err ", err);
          setIsLoader(false);
        }
      }
    } else {
      setIsLoader(false);
    }
  };
  return (
    <>
      <Title title={reportName} drive={""}/>
      {isLoader ? (
        <div className="h-[100vh] flex justify-center items-center">
          <Loader />
        </div>
      ) : (
        <>
          {reportName ? (
            <ReportTable
              ReportName={reportName}
              List={List}
              setList={setList}
              actions={actions}
              heading={heading}
              setIsNextRecord={setIsNextRecord}
              isMoreDocs={isMoreDocs}
              docPerPage={docPerPage}
              form={form}
              report_help={reporthelp}
              tourData={tourData}
              isDontShow={isDontShow}
              setIsPublic={setIsPublic}
              isPublic={isPublic}
            />
          ) : (
            <OpenSignPageNotFound prefix={"Report"} />
          )}
        </>
      )}
    </>
  );
};

export default Report;
