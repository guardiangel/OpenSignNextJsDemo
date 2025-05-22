import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import SendIcon from '@mui/icons-material/Send';
import { Box, IconButton, InputAdornment, Theme } from '@mui/material';
import { FC } from 'react';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((_theme: Theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        fontSize: '1.1rem',
    },
}));
export interface IconsProps {
    text?: string;
    handleMicClick: () => void;
    handleSendMessage: () => void;
}

const Icons: FC<IconsProps> = ({ handleMicClick, handleSendMessage }) => {
    const { classes } = useStyles();

    return (
        <>
            <Box>
                <InputAdornment position="end">
                    <Box className={classes.root}>
                        <IconButton onClick={handleMicClick}>
                            <KeyboardVoiceIcon />
                        </IconButton>
                        <IconButton onClick={handleSendMessage}>
                            <SendIcon />
                        </IconButton>
                    </Box>
                </InputAdornment>
            </Box>
        </>
    );
};
export default Icons;
