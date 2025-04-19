import { openInNewTab } from "@newComponents/opensigncomponents/constant/Methods";
import { Tooltip as ReactTooltip } from "react-tooltip";
const Tooltip = ({
  id,
  message,
  url,
  iconColor,
  maxWidth,
  handleOnlickHelp
}) =>
  url || handleOnlickHelp ? (
    <button
      onClick={() =>
        handleOnlickHelp ? handleOnlickHelp() : openInNewTab(url,"_blank")
      }
      className={"text-center cursor-pointer"}
    >
      <sup>
        <i
          className="fa-light fa-question rounded-full border-[1px] py-[1.5px] px-[4px] text-[13px]"
          style={{
            borderColor: iconColor ? iconColor : "#33bbff",
            color: iconColor ? iconColor : "#33bbff"
          }}
        ></i>
      </sup>
    </button>
  ) : (
    <>
      <a
        data-tooltip-id={id ? id : "my-tooltip"}
        data-tooltip-content={message}
        className="z-50"
      >
        <sup>
          <i
            className="fa-light fa-question rounded-full border-[1px] py-[1.5px] px-[4px] text-[13px]"
            style={{
              borderColor: iconColor ? iconColor : "#33bbff",
              color: iconColor ? iconColor : "#33bbff"
            }}
          ></i>
        </sup>
      </a>
      <ReactTooltip
        id={id ? id : "my-tooltip"}
        className={`${maxWidth ? maxWidth : "max-w-[200px]"}    z-[200]`}
      />
    </>
  );

export default Tooltip;
