import Chatbot from '@/newComponents/PdfChatBot/Chatbot';
import WelcomeScreen from '@/newComponents/PdfChatBot/WelcomeScreen';
import TryIcon from '@mui/icons-material/Try';
import { CircularProgress, IconButton, Theme } from '@mui/material';
import Box from '@mui/material/Box';
import { useState } from 'react';
import Draggable from 'react-draggable';
import { makeStyles } from 'tss-react/mui';
const useStyles = makeStyles()((_theme: Theme) => ({
    root: {
        position: 'fixed',
        bottom: 10,
        right: 10,
        width: '400px',
        height: '560px',
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        borderRadius: "16px",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',


    },
    chatIcon: {
        position: 'fixed',
        bottom: 20,
        right: 20,
        "&:hover": {
            backgroundColor: 'transparent'
        }
    },
}));

const PdfChatbot = ({ namespace = '', namespaceLoading = false }) => {
    const { classes } = useStyles();
    const [chatStarted, setChatStarted] = useState(true);
    const [chatVisible, setChatVisible] = useState(false);

    const toggleChatVisibility = () => {
        setChatVisible(!chatVisible);
    };

    const handleStartChat = () => {
        setChatStarted(false);
    };

    const handleResetChat = () => {
        setChatStarted(false);
    };

    return (
        <>
            {namespaceLoading ? (
                <CircularProgress className={classes.chatIcon} />
            ) : (
                <Draggable>
                    {chatVisible ? (
                        <Box className={classes.root}>
                            {chatStarted ? (
                                <WelcomeScreen
                                    toggleChatVisibility={toggleChatVisibility}
                                    handleResetChat={handleResetChat}
                                    handleStartChat={handleStartChat}
                                />
                            ) : (
                                <Chatbot
                                    toggleChatVisibility={toggleChatVisibility}
                                    chatStarted={chatStarted}
                                    namespace={namespace}
                                />
                            )}
                        </Box>
                    ) : (
                        <IconButton

                            onClick={toggleChatVisibility}
                            className={classes.chatIcon}
                            title="Chat with AI"
                        >
                            <TryIcon
                                sx={{
                                    color: '#0080ff',
                                    fontSize: '40px'
                                }}
                            />
                            {/* <Image src="/NewImages/Chat Icon.svg" width={80} height={80} alt='chat icon'/> */}
                        </IconButton>
                    )}
                </Draggable>
            )}
        </>
    );
};

export default PdfChatbot;
