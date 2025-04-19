import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import Dashboard from '@components/DocDrive/Dashboard';
import {
    FindFolderQuery,
    GetChildFoldersQuery,
    formatDoc,
} from '@components/DocDrive/helpers';
import { GetServerSidePropsContext } from 'next';
import { parseCookies } from 'nookies';

const Page = ({ folderId, folder, childFolders }) => {
    return (
        <>
            <Dashboard
                initialFolderData={folder}
                initialChildFolders={childFolders}
            />
        </>
    );
};

export default Page;
export const getServerSideProps = async (
    context: GetServerSidePropsContext
) => {
    const { req } = context;
    const folderId = context?.query?.folderId;
    const cookies = parseCookies({ req });
    const token = cookies['auth-token'];
    const client = new ApolloClient({
        link: new HttpLink({
            uri: 'http://localhost:4000/graphql',
            headers: {
                authorization: `Bearer ${token}`,
            },
        }),
        cache: new InMemoryCache(),
    });
    const { data: folderData } = await client.query({
        query: FindFolderQuery,
        variables: {
            id: folderId,
        },
    });
    const { data: childFoldersData } = await client.query({
        query: GetChildFoldersQuery,
        variables: {
            parentId: folderId,
        },
    });

    return {
        props: {
            folderId: folderId,
            folder: formatDoc(folderData?.findFolder),
            childFolders: childFoldersData?.getFoldersByParent.map(formatDoc),
        },
    };
};
