import Parse from "@/newComponents/opensigncomponents/parseClient";;
import { useMsal } from "@azure/msal-react";
import axios from "axios";
import { useState } from "react";
import { useTranslation } from "react-i18next";
// import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { appInfo } from "@/newComponents/opensigncomponents/constant/appinfo";
import { emailRegex, isEnableSubscription } from "@/newComponents/opensigncomponents/constant/const";
import { showTenant } from "@/newComponents/opensigncomponents/redux/reducers/ShowTenant";
import {
  fetchSubscription,
  openInNewTab,
  OpenSignServerURL,
  saveLanguageInLocal,
  XParseApplicationId
} from "@/newComponents/opensigncomponents/constant/Utils";
import { useWindowSize } from "@/newComponents/opensigncomponents/hook/useWindowSize";
import Alert from "@/newComponents/opensigncomponents/primitives/Alert";
import Loader from "@/newComponents/opensigncomponents/primitives/Loader";
import ModalUi from "@/newComponents/opensigncomponents/primitives/ModalUi";
import Title from "@/newComponents/opensigncomponents/Title";
import Link from "next/link";
import { useRouter } from "next/router";

function Login() {
  
  const { t, i18n } = useTranslation();
  // const navigate = useNavigate();
    const router = useRouter();
  // const location = useLocation();
  // const dispatch = useDispatch();
  const { width } = useWindowSize();
  const [state, setState] = useState({
    email: "",
    alertType: "success",
    alertMsg: "",
    password: "",
    passwordVisible: false,
    mobile: "",
    phone: "",
    scanResult: "",
    baseUrl: OpenSignServerURL,
    parseAppId: XParseApplicationId,
    loading: false,
    thirdpartyLoader: false
  });
  const [userDetails, setUserDetails] = useState<any>({
    Company: "",
    Destination: ""
  });
  const [isModal, setIsModal] = useState(false);
  const [image, setImage] = useState();
  const [isLoginSSO, setIsLoginSSO] = useState(false);
  const [errMsg, setErrMsg] = useState();

  const handleChange = (event) => {
    let { name, value } = event.target;
    if (name === "email") {
      value = value?.toLowerCase()?.replace(/\s/g, "");
    }
    setState({ ...state, [name]: value });
  };
  const handlePaidRoute = () => {
    router.push("/subscription");
  };

  const { instance } = useMsal();
  const handleAzureLogin = () => {
    instance
      .loginRedirect()
      .catch((error) => console.log(`Azure Login error:${error}`));
  };

  //When clicking the login button
  const handleSubmit = async (event) => {
    localStorage.removeItem("accesstoken");
    event.preventDefault();
    if (!emailRegex.test(state.email)) {
      alert("Please enter a valid email address.");
    } else {
      const { email, password } = state;
      if (email && password) {
        try {
          setState({ ...state, loading: true });
          localStorage.setItem("appLogo", String(appInfo.applogo));
          // Pass the username and password to logIn function
          const user = await Parse.User.logIn(email, password);
          if (user) {
            let _user = user.toJSON();
            localStorage.setItem("UserInformation", JSON.stringify(_user));
            localStorage.setItem("userEmail", email);
            localStorage.setItem("accesstoken", _user.sessionToken);
            localStorage.setItem("scriptId", "true");
            if (_user.ProfilePic) {
              localStorage.setItem("profileImg", _user.ProfilePic);
            } else {
              localStorage.setItem("profileImg", "");
            }
            // Check extended class user role and tenentId
            try {
              const userSettings = appInfo.settings;
              await Parse.Cloud.run("getUserDetails")
                .then(async (extUser) => {
                  if (extUser) {
                    // console.log("extUser", extUser, extUser?.get("IsDisabled"));
                    const IsDisabled = extUser?.get("IsDisabled") || false;
                    if (!IsDisabled) {
                      const userRole = extUser?.get("UserRole");
                      const menu =
                        userRole &&
                        userSettings.find((menu) => menu.role === userRole);
                      if (menu) {
                        const _currentRole = userRole;
                        const redirectUrl =
                          // location?.state?.from ||
                          `/${menu.pageType}/${menu.pageId}`;
                        let _role = _currentRole.replace("contracts_", "");
                        localStorage.setItem("_user_role", _role);
                        const checkLanguage = extUser?.get("Language");
                        if (checkLanguage) {
                          checkLanguage && i18n.changeLanguage(checkLanguage);
                        }

                        const results = [extUser];
                        const extUser_str = JSON.stringify(results);

                        localStorage.setItem("Extand_Class", extUser_str);
                        const extInfo = JSON.parse(JSON.stringify(extUser));
                        localStorage.setItem("userEmail", extInfo.Email);
                        localStorage.setItem("username", extInfo.Name);
                        if (extInfo?.TenantId) {
                          const tenant = {
                            Id: extInfo?.TenantId?.objectId || "",
                            Name: extInfo?.TenantId?.TenantName || ""
                          };
                          localStorage.setItem("TenantId", tenant?.Id);
                          //dispatch(showTenant(tenant?.Name));
                          localStorage.setItem("TenantName", tenant?.Name);
                        }
                        localStorage.setItem("PageLanding", menu.pageId);
                        localStorage.setItem("defaultmenuid", menu.menuId);
                        localStorage.setItem("pageType", menu.pageType);
                        if (isEnableSubscription) {
                          const LocalUserDetails = {
                            name: results[0].get("Name"),
                            email: results[0].get("Email"),
                            phone: results[0]?.get("Phone") || "",
                            company: results[0].get("Company")
                          };
                          localStorage.setItem(
                            "userDetails",
                            JSON.stringify(LocalUserDetails)
                          );
                        } else {
                          setState({ ...state, loading: false });
                          // Redirect to the appropriate URL after successful login
                          console.log("OpenSignLogin after login:", redirectUrl)
                          router.push("/dashboard");
                        }
                      } else {
                        setState({ ...state, loading: false });
                        setIsModal(true);
                      }
                    } else {
                      setState({
                        ...state,
                        loading: false,
                        alertType: "danger",
                        alertMsg:
                          "You don't have access, please contact the admin."
                      });
                      logOutUser();
                    }
                  } else {
                    if (isEnableSubscription) {
                      setState({ ...state, loading: false });
                      setIsModal(true);
                    } else {
                      setState({ ...state, loading: false });
                      setState({
                        ...state,
                        loading: false,
                        alertType: "danger",
                        alertMsg: "User not found."
                      });
                      logOutUser();
                    }
                  }
                })
                .catch((error) => {
                  // const payload = { sessionToken: user.getSessionToken() };
                  // handleSubmitbtn(payload);
                  setState({
                    ...state,
                    loading: false,
                    alertType: "danger",
                    alertMsg: `Something went wrong.`
                  });
                  setTimeout(() => setState({ ...state, alertMsg: "" }), 2000);
                  console.error("Error while fetching Follow", error);
                });
            } catch (error:any) {
              setState({
                ...state,
                loading: false,
                alertType: "danger",
                alertMsg: `${error.message}`
              });
              console.log(error);
              setTimeout(() => setState({ ...state, alertMsg: "" }), 2000);
            }
          }
        } catch (error) {
          setState({
            ...state,
            loading: false,
            alertType: "danger",
            alertMsg: "Invalid username or password!"
          });
          console.error("Error while logging in user", error);
        } finally {
          setTimeout(
            () => setState((prev) => ({ ...prev, alertMsg: "" })),
            5000
          );
        }
      }
    }
  };

  const setThirdpartyLoader = (value) => {
    setState({ ...state, thirdpartyLoader: value });
  };
  const handleFreePlan = async (id) => {
    try {
      const params = { userId: id };
      const res = await Parse.Cloud.run("freesubscription", params);
      if (res.status === "error") {
        alert(res.result);
      }
    } catch (err:any) {
      console.log("err in free subscribe", err.message);
      alert(t("something-went-wrong-mssg"));
    }
  };
  const thirdpartyLoginfn = async (sessionToken) => {
    const baseUrl = OpenSignServerURL;
    const parseAppId = XParseApplicationId;
    const res = await axios.get(baseUrl + "/users/me", {
      headers: {
        "X-Parse-Session-Token": sessionToken,
        "X-Parse-Application-Id": parseAppId
      }
    });
    // const param = new URLSearchParams(location.search);
    // const isFreeplan = param?.get("subscription") === "freeplan";
    // if (isFreeplan) {
    //   await handleFreePlan(res.data.objectId);
    // }
    const isFreeplan=true;
    await Parse.User.become(sessionToken).then(() => {
      window.localStorage.setItem("accesstoken", sessionToken);
    });
    if (res.data) {
      let _user = res.data;
      localStorage.setItem("UserInformation", JSON.stringify(_user));
      localStorage.setItem("userEmail", _user.email);
      localStorage.setItem("accesstoken", _user.sessionToken);
      localStorage.setItem("scriptId", "true");
      if (_user.ProfilePic) {
        localStorage.setItem("profileImg", _user.ProfilePic);
      } else {
        localStorage.setItem("profileImg", "");
      }
      // Check extended class user role and tenentId
      try {
        const userSettings = appInfo.settings;
        await Parse.Cloud.run("getUserDetails")
          .then(async (extUser) => {
            if (extUser) {
              const IsDisabled = extUser?.get("IsDisabled") || false;
              if (!IsDisabled) {
                const userRole = extUser?.get("UserRole");
                const menu =
                  userRole &&
                  userSettings.find((menu) => menu.role === userRole);
                if (menu) {
                  const _currentRole = userRole;
                  const redirectUrl =
                    // location?.state?.from || 
                    `/${menu.pageType}/${menu.pageId}`;
                  const _role = _currentRole.replace("contracts_", "");
                  localStorage.setItem("_user_role", _role);
                  const results = [extUser];
                  const extUser_stringify = JSON.stringify(results);
                  localStorage.setItem("Extand_Class", extUser_stringify);
                  const extInfo = JSON.parse(JSON.stringify(extUser));
                  localStorage.setItem("userEmail", extInfo?.Email);
                  localStorage.setItem("username", extInfo?.Name);
                  if (extInfo?.TenantId) {
                    const tenant = {
                      Id: extInfo?.TenantId?.objectId || "",
                      Name: extInfo?.TenantId?.TenantName || ""
                    };
                    localStorage.setItem("TenantId", tenant?.Id);
                    // dispatch(showTenant(tenant?.Name));
                    localStorage.setItem("TenantName", tenant?.Name);
                  }
                  localStorage.setItem("PageLanding", menu.pageId);
                  localStorage.setItem("defaultmenuid", menu.menuId);
                  localStorage.setItem("pageType", menu.pageType);
                  if (isEnableSubscription) {
                    const res = await fetchSubscription(undefined,undefined,undefined,undefined,undefined);
                    const plan = res.plan;
                    const billingDate = res.billingDate;
                    if (plan === "freeplan") {
                      router.push(redirectUrl);
                    } else if (billingDate) {
                      if (new Date(billingDate) > new Date()) {
                        localStorage.removeItem("userDetails");
                        router.push(redirectUrl);
                      } else {
                        if (isFreeplan) {
                          router.push(redirectUrl);
                        } else {
                          handlePaidRoute();
                        }
                      }
                    } else {
                      if (isFreeplan) {
                        router.push(redirectUrl);
                      } else {
                        handlePaidRoute();
                      }
                    }
                  } else {
                    router.push(redirectUrl);
                  }
                } else {
                  setState({
                    ...state,
                    loading: false,
                    alertType: "danger",
                    alertMsg: "Role not found."
                  });
                  logOutUser();
                }
              } else {
                setState({
                  ...state,
                  loading: false,
                  alertType: "danger",
                  alertMsg: "You don't have access, please contact the admin."
                });
                logOutUser();
              }
            } else {
              setState({
                ...state,
                alertType: "danger",
                alertMsg: "User not found."
              });
              logOutUser();
            }
          })
          .catch((err) => {
            console.error("err in fetching extUser", err);
            setState({
              ...state,
              alertType: "danger",
              alertMsg: `${err.message}`
            });
            const payload = { sessionToken: sessionToken };
            handleSubmitbtn(payload);
          });
      } catch (error:any) {
        setState({
          ...state,
          alertType: "danger",
          alertMsg: `${error.message}`
        });
        console.log(error);
      } finally {
        setThirdpartyLoader(false);
        setState({ ...state, loading: false });
        setTimeout(() => setState({ ...state, alertMsg: "" }), 2000);
      }
    }
  };

  const GetLoginData = async () => {
    setState({ ...state, loading: true });
    try {
      const user = await Parse.User.become(localStorage.getItem("accesstoken")!);
      const _user = user.toJSON();
      localStorage.setItem("UserInformation", JSON.stringify(_user));
      localStorage.setItem("accesstoken", _user.sessionToken);
      localStorage.setItem("scriptId", "true");
      if (_user.ProfilePic) {
        localStorage.setItem("profileImg", _user.ProfilePic);
      } else {
        localStorage.setItem("profileImg", "");
      }
      const userSettings = appInfo.settings;
      await Parse.Cloud.run("getUserDetails").then(async (extUser) => {
        if (extUser) {
          const IsDisabled = extUser?.get("IsDisabled") || false;
          if (!IsDisabled) {
            const userRole = extUser.get("UserRole");
            const _currentRole = userRole;
            const menu =
              userRole && userSettings.find((menu) => menu.role === userRole);
            if (menu) {
              const _role = _currentRole.replace("contracts_", "");
              localStorage.setItem("_user_role", _role);
              const redirectUrl =
                // location?.state?.from || 
                `/${menu.pageType}/${menu.pageId}`;
              const results = [extUser];
              const extendedInfo_stringify = JSON.stringify(results);
              localStorage.setItem("Extand_Class", extendedInfo_stringify);
              const extInfo = JSON.parse(JSON.stringify(extUser));
              localStorage.setItem("userEmail", extInfo.Email);
              localStorage.setItem("username", extInfo.Name);
              if (extInfo?.TenantId) {
                const tenant = {
                  Id: extInfo?.TenantId?.objectId || "",
                  Name: extInfo?.TenantId?.TenantName || ""
                };
                localStorage.setItem("TenantId", tenant?.Id);
                //dispatch(showTenant(tenant?.Name));
                localStorage.setItem("TenantName", tenant?.Name);
              }
              localStorage.setItem("PageLanding", menu.pageId);
              localStorage.setItem("defaultmenuid", menu.menuId);
              localStorage.setItem("pageType", menu.pageType);
              if (isEnableSubscription) {
                const userInfo = {
                  name: results[0].get("Name"),
                  email: results[0].get("Email"),
                  phone: results[0]?.get("Phone") || "",
                  company: results[0]?.get("Company")
                };
                localStorage.setItem("userDetails", JSON.stringify(userInfo));
                const res = await fetchSubscription(undefined,undefined,undefined,undefined,undefined);
                const billingDate = res.billingDate;
                const plan = res.plan;
                if (plan === "freeplan") {
                  router.push(redirectUrl);
                } else if (billingDate) {
                  if (new Date(billingDate) > new Date()) {
                    localStorage.removeItem("userDetails");
                    // Redirect to the appropriate URL after successful login
                    router.push(redirectUrl);
                  } else {
                    handlePaidRoute();
                  }
                } else {
                  handlePaidRoute();
                }
              } else {
                // Redirect to the appropriate URL after successful login
                router.push(redirectUrl);
              }
            } else {
              setState({ ...state, loading: false });
              logOutUser();
            }
          } else {
            setState({
              ...state,
              loading: false,
              alertType: "danger",
              alertMsg: "You don't have access, please contact the admin."
            });
            logOutUser();
          }
        } else {
          setState({
            ...state,
            alertType: "danger",
            alertMsg: "User not found."
          });
          logOutUser();
        }
      });
    } catch (error) {
      setState({
        ...state,
        alertType: "danger",
        alertMsg: "Something went wrong, please try again later."
      });
      console.log("err", error);
    } finally {
      setState({ ...state, loading: false });
      setTimeout(() => setState({ ...state, alertMsg: "" }), 2000);
    }
  };

  const togglePasswordVisibility = () => {
    setState({ ...state, passwordVisible: !state.passwordVisible });
  };

  const handleSubmitbtn = async (e) => {
    e.preventDefault();
    if (userDetails.Destination && userDetails.Company) {
      setThirdpartyLoader(true);
      // console.log("handelSubmit", userDetails);
      // const payload = await Parse.User.logIn(state.email, state.password);
      const payload:any = { sessionToken: localStorage.getItem("accesstoken") };
      const userInformation = JSON.parse(
        localStorage.getItem("UserInformation")!
      );
      // console.log("payload ", payload);
      if (payload && payload.sessionToken) {
        const params = {
          userDetails: {
            name: userInformation.name,
            email: userInformation.email,
            phone: userInformation?.phone || "",
            role: "contracts_User",
            company: userDetails.Company,
            jobTitle: userDetails.Destination
          }
        };
        const userSignUp = await Parse.Cloud.run("usersignup", params);
        // console.log("userSignUp ", userSignUp);
        if (userSignUp && userSignUp.sessionToken) {
          const LocalUserDetails = {
            name: userInformation.name,
            email: userInformation.email,
            phone: userInformation?.phone || "",
            company: userDetails.Company,
            jobTitle: userDetails.JobTitle
          };
          localStorage.setItem("userDetails", JSON.stringify(LocalUserDetails));
          thirdpartyLoginfn(userSignUp.sessionToken);
        } else {
          alert(userSignUp.message);
        }
      } else if (
        payload &&
        payload.message.replace(/ /g, "_") === "Internal_server_err"
      ) {
        alert(t("server-error"));
      }
    } else {
      setState({
        ...state,
        loading: false,
        alertType: "warning",
        alertMsg: "Please fill required details."
      });
      setTimeout(() => setState((prev) => ({ ...prev, alertMsg: "" })), 2000);
    }
  };

  const logOutUser = async () => {
    setIsModal(false);
    try {
      await Parse.User.logOut();
    } catch (err:any) {
      console.log("Err while logging out", err);
    }
    let appdata = localStorage.getItem("userSettings");
    let applogo = localStorage.getItem("appLogo");
    let defaultmenuid = localStorage.getItem("defaultmenuid");
    let PageLanding = localStorage.getItem("PageLanding");
    let baseUrl = OpenSignServerURL;
    let appid = XParseApplicationId;

    localStorage.clear();
    saveLanguageInLocal(i18n);

    localStorage.setItem("appLogo", String(applogo));
    localStorage.setItem("defaultmenuid", String(defaultmenuid));
    localStorage.setItem("PageLanding", String(PageLanding));
    localStorage.setItem("userSettings", String(appdata));
    localStorage.setItem("baseUrl", String(baseUrl));
    localStorage.setItem("parseAppId", String(appid));
  };

  // `handleSignInWithSSO` is trigger when user click sign in with sso and open sso authorize endpoint
  const handleSignInWithSSO = () => {
    if (isLoginSSO === false) {
      if (state?.email) {
        setIsLoginSSO(true);
        const encodedEmail = encodeURIComponent(state.email);
        const clientUrl = window.location.origin;
        const domain = state.email.split("@")?.pop();
        const ssoApiUrl =
          process.env.SSO_API_URL || "https://EducationCa.com";
        openInNewTab(
          `${ssoApiUrl}/oauth/authorize?response_type=code&provider=saml&tenant=${domain}&product=OpenSign&redirect_uri=${clientUrl}/sso&state=${encodedEmail}`,
          "_self"
        );
      } else {
        alert(t("provide-email"));
      }
    }
  };

  return errMsg ? (
    <div className="h-screen flex justify-center text-center items-center p-4 text-gray-500 text-base">
      {errMsg}
    </div>
  ) : (
    <div>
      <Title title={"Login Page"} drive={""}/>
      {state.loading && (
        <div
          aria-live="assertive"
          className="fixed w-full h-full flex justify-center items-center bg-black bg-opacity-30 z-50"
        >
          <Loader />
        </div>
      )}
      {appInfo && appInfo.appId ? (
        <>
          <div
            aria-labelledby="loginHeading"
            role="region"
            className="md:p-10 lg:p-16"
          >
            <div className="md:p-4 lg:p-10 p-4 bg-base-100 text-base-content op-card">
              <div className="w-[250px] h-[66px] inline-block overflow-hidden">
                {image && (
                  <img
                    src={image}
                    className="object-contain h-full"
                    alt="applogo"
                  />
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2">
                <div>
                  <form onSubmit={handleSubmit} aria-label="Login Form">
                    <h1 className="text-[30px] mt-6">{t("welcome")}</h1>
                    <fieldset>
                      <legend className="text-[12px] text-[#878787]">
                        {t("Login-to-your-account")}
                      </legend>
                      <div className="w-full px-6 py-3 my-1 op-card bg-base-100 shadow-md outline outline-1 outline-slate-300/50">
                        <label className="block text-xs" htmlFor="email">
                          {t("email")}
                        </label>
                        <input
                          id="email"
                          type="email"
                          className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                          name="email"
                          autoComplete="username"
                          value={state.email}
                          onChange={handleChange}
                          required
                          onInvalid={(e) =>
                            (e.target as HTMLInputElement).setCustomValidity(t("input-required"))
                          }
                          onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
                        />
                        <hr className="my-1 border-none" />
                        {!isLoginSSO && (
                          <>
                            <label className="block text-xs" htmlFor="password">
                              {t("password")}
                            </label>
                            <div className="relative">
                              <input
                                id="password"
                                type={
                                  state.passwordVisible ? "text" : "password"
                                }
                                className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                                name="password"
                                value={state.password}
                                autoComplete="current-password"
                                onChange={handleChange}
                                onInvalid={(e) =>
                                  (e.target as HTMLInputElement).setCustomValidity(
                                    t("input-required")
                                  )
                                }
                                onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
                                required
                              />
                              <span
                                className="absolute cursor-pointer top-[50%] right-[10px] -translate-y-[50%] text-base-content"
                                onClick={togglePasswordVisibility}
                              >
                                {state.passwordVisible ? (
                                  <i className="fa-light fa-eye-slash text-xs pb-1" /> // Close eye icon
                                ) : (
                                  <i className="fa-light fa-eye text-xs pb-1 " /> // Open eye icon
                                )}
                              </span>
                            </div>
                          </>
                        )}
                        <div className="relative mt-1">
                          <Link
                            href="/forgetpassword"
                            className="text-[13px] op-link op-link-primary underline-offset-1 focus:outline-none ml-1"
                          >
                            {t("forgot-password")}
                          </Link>
                        </div>
                      </div>
                    </fieldset>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-center text-xs font-bold mt-2">
                      <button
                        type="submit"
                        className="op-btn op-btn-primary"
                        disabled={state.loading}
                      >
                        {state.loading ? t("loading") : t("login")}
                      </button>
                      <button
                        type="button"
                        className="op-btn op-btn-primary"
                        onClick={(e) => handleAzureLogin()}
                      >
                        {"Azure Login "}
                      </button>
                      {/* {isEnableSubscription && (
                        <button
                          type="button"
                          className="op-btn op-btn-accent"
                          disabled={state.loading}
                          onClick={() =>
                            navigate(
                              location.search
                                ? "/signup" + location.search
                                : "/signup"
                            )
                          }
                        >
                          {t("create-account")}
                        </button>
                      )} */}
                    </div>
                  </form>
                  {(appInfo.googleClietId || isEnableSubscription) && (
                    <div className="op-divider my-4 text-sm">{t("or")}</div>
                  )}
                  <div className="flex flex-col justify-center items-center gap-y-3">
                    {isEnableSubscription && (
                      <div
                        className="cursor-pointer border-[1px] border-gray-300 rounded px-[40px] py-2 font-semibold text-sm hover:border-[#d2e3fc] hover:bg-[#ecf3feb7]"
                        onClick={() => handleSignInWithSSO()}
                      >
                        {t("sign-SSO")}
                      </div>
                    )}
                  </div>
                </div>
                {width >= 768 && (
                  <div className="place-self-center">
                    <div className="mx-auto md:w-[300px] lg:w-[400px] xl:w-[500px]">
                      <img
                        src="/Images/login_img.svg"
                        alt="The image illustrates a person from behind, seated at a desk with a four-monitor computer setup, in an environment with a light blue and white color scheme, featuring a potted plant to the right."
                        width="100%"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* <SelectLanguage /> */}
            {state.alertMsg && (
              <Alert type={state.alertType} className={""}>{state.alertMsg}</Alert>
            )}
          </div>
          <ModalUi
            isOpen={isModal}
            title={t("additional-info")}
            showClose={false}
            reduceWidth={true} 
            handleClose={()=>{}}
          >
            <form className="px-4 py-3 text-base-content">
              <div className="mb-3">
                <label
                  htmlFor="Company"
                  style={{ display: "flex" }}
                  className="block text-xs text-gray-700 font-semibold"
                >
                  {t("company")}{" "}
                  <span className="text-[red] text-[13px]">*</span>
                </label>
                <input
                  type="text"
                  className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                  id="Company"
                  value={userDetails.Company}
                  onChange={(e) =>
                    setUserDetails({
                      ...userDetails,
                      Company: e.target?.value
                    })
                  }
                  onInvalid={(e) =>
                    (e.target as HTMLInputElement).setCustomValidity(t("input-required"))
                  }
                  onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
                  required
                />
              </div>
              <div className="mb-3">
                <label
                  htmlFor="JobTitle"
                  style={{ display: "flex" }}
                  className="block text-xs text-gray-700 font-semibold"
                >
                  {t("job-title")}
                  <span className="text-[red] text-[13px]">*</span>
                </label>
                <input
                  type="text"
                  className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                  id="JobTitle"
                  value={userDetails.Destination}
                  onChange={(e) =>
                    setUserDetails({
                      ...userDetails,
                      Destination: e.target?.value
                    })
                  }
                  onInvalid={(e) =>
                    (e.target as HTMLInputElement).setCustomValidity(t("input-required"))
                  }
                  onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
                  required
                />
              </div>
              <div className="mt-4 gap-2 flex flex-row">
                <button
                  type="button"
                  className="op-btn op-btn-primary"
                  onClick={(e) => handleSubmitbtn(e)}
                >
                  {t("login")}
                </button>

                <button
                  type="button"
                  className="op-btn op-btn-ghost"
                  onClick={logOutUser}
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          </ModalUi>
        </>
      ) : (
        <div
          aria-live="assertive"
          className="fixed w-full h-full flex justify-center items-center z-50"
        >
          <Loader />
        </div>
      )}
    </div>
  );
}
export default Login;
