import Link from 'next/link';
import { useState } from 'react';

const Sidebar = () => {
    const [reportOpen, setReportOpen] = useState(false);
    return (
        <div className="h-screen w-64 bg-gray-800 text-white p-4 space-y-4 fixed overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">OpenSignNextJs/NestJs</h2>
            <nav className="flex flex-col space-y-2">
                <Link
                    href="/opensignpages/AddAdmin"
                    className="hover:bg-gray-700 p-2 rounded"
                >
                    Add Admin
                </Link>
                <Link
                    href="/opensignpages/OpenSignLogin"
                    className="hover:bg-gray-700 p-2 rounded"
                >
                    Login
                </Link>
                <Link
                    href="/opensignpages/OpenSignForm?id=sHAnZphf69"
                    className="hover:bg-gray-700 p-2 rounded"
                >
                    Self signature
                </Link>
                <Link
                    href="/opensignpages/OpenSignForm?id=8mZzFxbG1z"
                    className="hover:bg-gray-700 p-2 rounded"
                >
                    Request signature
                </Link>
                <Link
                    href="/opensignpages/UserList"
                    className="hover:bg-gray-700 p-2 rounded"
                >
                    UserList
                </Link>
                <Link
                    href="/opensignpages/Opensigndrive"
                    className="hover:bg-gray-700 p-2 rounded"
                >
                    Drive
                </Link>
                <div>
                    <button
                        onClick={() => setReportOpen(!reportOpen)}
                        className="w-full text-left hover:bg-gray-700 p-2 rounded flex justify-between items-center"
                    >
                        <span>Report</span>
                        <span>{reportOpen ? '▲' : '▼'}</span>
                    </button>
                    {reportOpen && (
                        <div className="ml-4 mt-1 flex flex-col space-y-1">
                            <Link
                                href="/report/4Hhwbp482K"
                                className="hover:bg-gray-700 p-2 rounded"
                            >
                                Need you sign
                            </Link>
                            <Link
                                href="/report/1MwEuxLEkF"
                                className="hover:bg-gray-700 p-2 rounded"
                            >
                                In Progress
                            </Link>
                            <Link
                                href="/report/kQUoW4hUXz"
                                className="hover:bg-gray-700 p-2 rounded"
                            >
                                Completed
                            </Link>
                            <Link
                                href="/report/ByHuevtCFY"
                                className="hover:bg-gray-700 p-2 rounded"
                            >
                                Drafts
                            </Link>
                            <Link
                                href="/report/UPr2Fm5WY3"
                                className="hover:bg-gray-700 p-2 rounded"
                            >
                                Declined
                            </Link>
                            <Link
                                href="/report/zNqBHXHsYH"
                                className="hover:bg-gray-700 p-2 rounded"
                            >
                                Expired
                            </Link>
                            <Link
                                href="/report/5KhaPr482K"
                                className="hover:bg-gray-700 p-2 rounded"
                            >
                                Contactbook
                            </Link>
                        </div>
                    )}
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
