import "@/newComponents/opensigncomponents/parseClient";;
import { XParseApplicationId } from "@newComponents/opensigncomponents/constant/Utils";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import ModalUi from "./ModalUi";
const Validate = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const [isUserValid, setIsUserValid] = useState(true);
  useEffect(() => {
    (async () => {
      if (localStorage.getItem("accesstoken")) {
        try {
          const userDetails = JSON.parse(
            localStorage.getItem(
              `Parse/${XParseApplicationId}/currentUser`
            )!
          );
          // Use the session token to validate the user
          const userQuery = new Parse.Query(Parse.User);
          const user = await userQuery.get(userDetails?.objectId, {
            sessionToken: localStorage.getItem("accesstoken") ?? undefined
          });
          if (user) {
            setIsUserValid(true);
          } else {
            setIsUserValid(false);
          }
        } catch (error) {
          // Session token is invalid or there was an error
          setIsUserValid(false);
        }
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoginBtn = async () => {
    try {
      await Parse.User.logOut();
    } catch (err:any) {
      console.log("err ", err);
    } finally {
      localStorage.removeItem("accesstoken");
      navigate("/", { replace: true, state: { from: location } });
    }
  };
  return isUserValid ? (
    <div>
      <Outlet />
    </div>
  ) : (
    <ModalUi showHeader={false} isOpen={true} showClose={false} reduceWidth={true}  title=""
    handleClose={() => {}}
    >
      <div className="flex flex-col justify-center items-center py-4 md:py-5 gap-5">
        <p className="text-xl font-medium">{t("session-expired")}</p>
        <button onClick={handleLoginBtn} className="op-btn op-btn-neutral">
          {t("login")}
        </button>
      </div>
    </ModalUi>
  );
};

export default Validate;
