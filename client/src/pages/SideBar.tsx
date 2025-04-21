import Link from "next/link";

const Sidebar = () => {
  return (
    <div className="h-screen w-64 bg-gray-800 text-white p-4 space-y-4 fixed">
      <h2 className="text-xl font-bold mb-4">OpenSignNextJs/NestJs</h2>
      <nav className="flex flex-col space-y-2">
        <Link href="/opensignpages/AddAdmin" className="hover:bg-gray-700 p-2 rounded">
          Add Admin
        </Link>
        <Link href="/opensignpages/OpenSignLogin" className="hover:bg-gray-700 p-2 rounded">
          Login
        </Link>
        <Link href="/opensignpages/OpenSignForm?id=sHAnZphf69" className="hover:bg-gray-700 p-2 rounded">
          Self signature
        </Link>
        <Link href="/opensignpages/OpenSignForm?id=8mZzFxbG1z" className="hover:bg-gray-700 p-2 rounded">
          Request signature
        </Link>
        <Link href="/opensignpages/UserList" className="hover:bg-gray-700 p-2 rounded">
         UserList
        </Link>
        <Link href="/opensignpages/Opensigndrive" className="hover:bg-gray-700 p-2 rounded">
        Drive
        </Link>
        <Link href="/opensignpages/Report" className="hover:bg-gray-700 p-2 rounded">
        Report
        </Link>
        <Link href="/settings" className="hover:bg-gray-700 p-2 rounded">
          Settings
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
