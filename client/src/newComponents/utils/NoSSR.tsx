// components/NoSSR.tsx
import { useEffect, useState } from 'react';

export default function NoSSR({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  // Correctly returning the children as JSX wrapped in a fragment
  return (<>{children}</>); 
}
