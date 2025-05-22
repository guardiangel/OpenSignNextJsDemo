'use client';
import TopBar from '@/newComponents/PdfChatBot/TopBar';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, Button, Theme, Typography } from '@mui/material';
import Image from 'next/image';
import { FC } from 'react';
import { makeStyles } from 'tss-react/mui';
const useStyles = makeStyles()((_theme: Theme) => ({
    root: {
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: '25%',
        height: '85%',
        maxHeight: '600px',
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        borderRadius: _theme.spacing(1),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        zIndex: 999,
    },
    topBar: {
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        padding: _theme.spacing(1),
        borderBottom: '1px solid #ccc',
        width: '100%',
    },
    chatBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        border: '1px solid #ccc',
        borderRadius: _theme.spacing(1),
        padding: _theme.spacing(1),
        marginBottom: _theme.spacing(2),
        width: '100%',
        backgroundColor: '#0080FF',
    },
    welcome: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: _theme.spacing(1),
        padding: _theme.spacing(1),
        marginBottom: _theme.spacing(1),
        width: '100%',
    },
    menuButton: {
        marginRight: _theme.spacing(1),
    },
    botIcon: {
        fontSize: 60,
        marginBottom: _theme.spacing(1),
    },
    startbtn: {
        color: 'white',
        background: '#0080FF !important',
        borderRadius: '50px',
        width: '80%',
        marginTop: '10px',
        textTransform: 'none',
    },
    textField: {
        width: '100%',
        marginTop: _theme.spacing(2),
        marginBottom: _theme.spacing(2),
    },
}));
export interface WelcomeScreenProps {
    text?: string;
    toggleChatVisibility?: () => void;
    handleResetChat?: () => void;
    handleStartChat?: () => void;
}

const WelcomeScreen: FC<WelcomeScreenProps> = ({
    toggleChatVisibility,
    handleResetChat,
    handleStartChat,
}) => {
    const { classes } = useStyles();

    return (
        <>
            <Box
               
            >
                <TopBar
                    toggleChatVisibility={toggleChatVisibility}
                    handleResetChat={handleResetChat}
                />
                <Box className={classes.chatBox}>
                    <Image
                        src="./Images/robot.svg"
                        alt="bot"
                        height={80}
                        width={100}
                    />
                    <Typography variant="h6" color="#F8F8F8">
                        Hi there! 👋
                    </Typography>
                    <Typography color="#FFFFFF"> How can we help?</Typography>
                </Box>
                <Box className={classes.welcome}>
                    <Image
                        src="./Images/next.svg"
                        alt="PersonBot"
                        height={80}
                        width={80}
                    />
                    <Typography variant="h6" color="#005bce">
                        Welcome to Chat AI
                    </Typography>
                    <Typography
                        color="#000000"
                        textAlign="center"
                        fontSize="14px"
                    >
                        A chat assistant that extracts, locates, and summarizes
                        information from your documents.
                    </Typography>
                    <Button
                        variant="contained"
                        className={classes.startbtn}
                        onClick={handleStartChat}
                        endIcon={<ArrowForwardIcon />}
                    >
                        Start
                    </Button>
                </Box>
            </Box>
        </>
    );
};
export default WelcomeScreen;
