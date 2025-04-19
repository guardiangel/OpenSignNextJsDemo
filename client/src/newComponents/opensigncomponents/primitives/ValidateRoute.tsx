import Parse from "@/pages/parseClient";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";
import { OpenSignServerURL, saveLanguageInLocal, XParseApplicationId } from "../constant/Utils";
const ValidateRoute = () => {
  const { i18n } = useTranslation();
  useEffect(() => {
    (async () => {
      if (localStorage.getItem("accesstoken")) {
        try {
          // Use the session token to validate the user
          const userQuery = new Parse.Query(Parse.User);
          const user = await userQuery.get(Parse?.User?.current()?.id, {
            sessionToken: localStorage.getItem("accesstoken")
          });
          if (!user) {
            handlelogout();
          }
        } catch (error) {
          console.log("err in validate route", error);
          handlelogout();
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handlelogout = async () => {
    let appdata = localStorage.getItem("userSettings");
    let applogo = localStorage.getItem("appLogo");
    let defaultmenuid = localStorage.getItem("defaultmenuid");
    let PageLanding = localStorage.getItem("PageLanding");
    let baseUrl = OpenSignServerURL;
    let appid = XParseApplicationId;

    localStorage.clear();
    saveLanguageInLocal(i18n);

    localStorage.setItem("appLogo", applogo);
    localStorage.setItem("defaultmenuid", defaultmenuid);
    localStorage.setItem("PageLanding", PageLanding);
    localStorage.setItem("userSettings", appdata);
    localStorage.setItem("baseUrl", baseUrl);
    localStorage.setItem("parseAppId", appid);
  };
  return <div>{<Outlet />}</div>;
};

export default ValidateRoute;
