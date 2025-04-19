import { useTranslation } from "react-i18next";
// import ReactQuill from "react-quill-new";
import dynamic from "next/dynamic";
import Tooltip from "../../../newComponents/opensigncomponents/primitives/Tooltip";
import {useRef} from "react";
import { EditorToolbar, formats, module1 } from "./EditorToolbar";
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export function EmailBody(props) {
  const { t } = useTranslation();
  const editorRef = useRef(null);
  return (
    <form className="flex flex-col text-base-content text-lg font-normal">
      <div className="m-2 md:m-10 p-3 md:p-10 shadow-md hover:shadow-lg border-[1px] border-indigo-800 rounded-md">
        <label className="text-sm ml-2">
          {t("subject")} <Tooltip message={t("email-subject")} />
        </label>
        <input
          required
          onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity(t("input-required"))}
          onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
          value={props.requestSubject}
          onChange={(e) => props.setRequestSubject(e.target?.value)}
          placeholder='${senderName} has requested you to sign "${documentName}"'
          className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
        />
        <label className="text-sm ml-2 mt-3">
          {t("body")} <Tooltip message={t("email-body")} />
        </label>
        <div className="px-1 py-2 w-full focus:outline-none text-xs">
          <EditorToolbar containerId="toolbar1" />
          aaaaaaaaaaaaaaaaaaaaaaaaaaaaa
          <ReactQuill
            theme="snow"
            value={props.requestBody}
            placeholder={t("email-placeholder")}
            // @ts-ignore - Suppress the error here
            ref={props.editorRef}
            modules={module1}
            formats={formats}
            onChange={props.handleOnchangeRequest}
          />
        </div>
      </div>
    </form>
  );
}
