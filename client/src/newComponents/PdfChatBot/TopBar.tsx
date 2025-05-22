'use client';
import DownloadIcon from '@mui/icons-material/Download';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import { Box, Grid, IconButton, Theme, Typography } from '@mui/material';
import { FC } from 'react';
import { makeStyles } from 'tss-react/mui';
const useStyles = makeStyles()((_theme: Theme) => ({
    topBar: {
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        padding: '0 20px',
      

    },
    topbox: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        color: 'black',
        borderBottom: '2px solid #E3E3E3',
    },
}));
export interface TopBarProps {
    text?: string;
    toggleChatVisibility?: () => void;
    handleResetChat?: () => void;
    handleDownload?: () => void;
    chatStarted?: boolean;
}

const TopBar: FC<TopBarProps> = ({
    toggleChatVisibility,
    handleResetChat,
    handleDownload,
    chatStarted = false,
}) => {
    const { classes } = useStyles();

    return (
        <>
            <Box className={classes.topbox}>
                <Grid container spacing={1} className={classes.topBar}>
                    {chatStarted ? (
                        <Grid item display="flex">
                            <IconButton
                                title="Download chat"
                                onClick={handleDownload}
                            >
                                <DownloadIcon />
                            </IconButton>
                            <IconButton title="Rest" onClick={handleResetChat}>
                                <RotateLeftIcon />
                            </IconButton>
                        </Grid>
                    ) : null}
                    <Grid item >
                        <Typography textAlign="center">
                            Chat with AI!
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        
                    >
                        <IconButton
                            title="Minimise"
                            onClick={toggleChatVisibility}
                        >
                            <HorizontalRuleIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
};
export default TopBar;
