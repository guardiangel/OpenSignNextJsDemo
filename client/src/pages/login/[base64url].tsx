import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

// Lazy load the GuestLogin component
const GuestLogin = dynamic(() => import('../opensignpages/GuestLogin'), { ssr: false });

const LoginPage = () => {
  const router = useRouter();
  const { base64url } = router.query; // Get the dynamic parameter

  if (!base64url) {
    return <div>Loading...</div>; // You can show a loading state if needed
  }

  return (
    <div>
      <h1>Login Page</h1>
      <GuestLogin base64url={base64url} />
    </div>
  );
};

export default LoginPage;
