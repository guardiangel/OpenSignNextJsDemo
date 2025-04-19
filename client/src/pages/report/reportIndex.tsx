import { useRouter } from "next/router";
const reportIndex = () => {

    const router = useRouter();

    return (
    <>
        <span
            className="dropdown-item text-[10px] md:text-[25px]"
            onClick={() => router.push("/report/4Hhwbp482K")}
        >
            <i className="fa-light fa-pen-nib mr-[5px]"></i>
            Need you sign
        </span>
        <span
            className="dropdown-item text-[10px] md:text-[25px]"
            onClick={() => router.push("/report/1MwEuxLEkF")}
        >
            <i className="fa-light fa-pen-nib mr-[5px]"></i>
            In Progress
        </span>
        <span
            className="dropdown-item text-[10px] md:text-[25px]"
            onClick={() => router.push("/report/kQUoW4hUXz")}
        >
            <i className="fa-light fa-pen-nib mr-[5px]"></i>
            Completed
        </span>
        <span
            className="dropdown-item text-[10px] md:text-[25px]"
            onClick={() => router.push("/report/ByHuevtCFY")}
        >
            <i className="fa-light fa-pen-nib mr-[5px]"></i>
            Drafts
        </span>
        <span
            className="dropdown-item text-[10px] md:text-[25px]"
            onClick={() => router.push("/report/UPr2Fm5WY3")}
        >
            <i className="fa-light fa-pen-nib mr-[5px]"></i>
            Declined
        </span>
        <span
            className="dropdown-item text-[10px] md:text-[25px]"
            onClick={() => router.push("/report/zNqBHXHsYH")}
        >
            <i className="fa-light fa-pen-nib mr-[5px]"></i>
            Expired
        </span>

        <span
            className="dropdown-item text-[10px] md:text-[25px]"
            onClick={() => router.push("/report/5KhaPr482K")}
        >
            <i className="fa-light fa-pen-nib mr-[5px]"></i>
            Contactbook
        </span>
       
    </>);
}

export default reportIndex;