import dynamic from 'next/dynamic';

// Higher Order Component to disable SSR
const withNoSSR = (Component) => {
  return dynamic(() => Promise.resolve(Component), { ssr: false });
};

export default withNoSSR;
