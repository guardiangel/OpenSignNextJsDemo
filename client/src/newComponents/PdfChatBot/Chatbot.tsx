import Icons from '@/newComponents/PdfChatBot/Icons';
import TopBar from '@/newComponents/PdfChatBot/TopBar';
import { useLazyQuery } from '@apollo/client';
import { Box, Paper, TextField, Theme } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import axios from 'axios';
import {
    OpenSignServerURL,
    XParseApplicationId,
} from '@/newComponents/opensigncomponents/constant/Utils';

const useStyles = makeStyles()((_theme: Theme) => ({
    root: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },
    buttonStyle: {
        borderRadius: '50px',
        width: '100%',
        fontSize: '18px',
    },
    topBar: {
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        // padding: '8px 16px',
    },
    paperStyle: {
        maxWidth: 460,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
    },
    messageContainer: {
        flexGrow: 1,
        overflowY: 'auto',
        maxHeight: '450px',
        padding: '8px 12px',
        width: '100%',
        zIndex: 999,
        '&::-webkit-scrollbar': {
            width: '10px',
        },
        '&::-webkit-scrollbar-track': {
            backgroundColor: '#ffffff',
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#c8d0de',
            borderRadius: '20px',
            border: '3px solid transparent',
            backgroundClip: 'content-box',
        },
    },
    messageStyle: {
        backgroundColor: '#F5F9FF',
        padding: '10px',
        maxWidth: '70%',
        borderRadius: '10px',
        fontWeight: '500',
    },
    senderMessageStyles: {
        backgroundColor: '#EBF5FF',
        border: '2px solid #0080FF',
        padding: '10px',
        maxWidth: '70%',
        borderRadius: '10px',
        color: '#005BCE',
        fontWeight: '500',
    },
    textFieldContainer: {
        backgroundColor: 'white',
        padding: '10px',
        borderTop: '2px solid #E3E3E3',
    },
}));

interface Message {
    id: number;
    sender: string;
    text: string;
}

interface ChatbotProps {
    toggleChatVisibility: () => void;
    chatStarted?: boolean;
    namespace: string;
}

const Chatbot: React.FC<ChatbotProps> = ({
    toggleChatVisibility,
    chatStarted,
    namespace,
}) => {
    const { classes } = useStyles();
    // const [getChatBotResponse] = useLazyQuery(GetChatbotResponseQuery);
    const [counter, setCounter] = useState(1);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 0,
            sender: 'agent',
            text: 'Hi! How can I help You today?',
        },
    ]);
    const [input, setInput] = useState<string>('');
    const messageContainerRef = useRef<HTMLDivElement>(null);
    const getResponse = (userQuery: string) => {
        // getChatBotResponse({ variables: { userQuery, namespace } })
        //     .then((result) => {
        //         const AiMessage = {
        //             id: counter,
        //             sender: 'agent',
        //             text: result?.data?.getChatBotResponse,
        //         };
        //         console.log('AI Message', AiMessage);
        //         setMessages((prevMessages) => [...prevMessages, AiMessage]);
        //         console.log('Messages after AI Message:', messages);
        //         setCounter((prevCounter) => prevCounter + 1);
        //         console.log('Counter after AI Message:', counter);
        //     })
        //     .catch((error) => {
        //         console.log(error);
        //     });

        const data = { userQuery: userQuery, namespace: namespace };
        const token = { sessionToken: localStorage.getItem('accesstoken') };
        //cloudServerUrl
        const res = axios
            .post(`${OpenSignServerURL}/functions/getChatbotResponse`, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Parse-Application-Id': XParseApplicationId,
                    ...token,
                },
            })
            .then((result) => {
                console.log('getChatbotResponse:', result);
                const AiMessage = {
                    id: counter,
                    sender: 'agent',
                    text: result?.data?.result,
                };
                console.log('Chatbot.tsx AI Message', AiMessage);
                setMessages((prevMessages) => [...prevMessages, AiMessage]);
                console.log('Chatbot.tsx Messages after AI Message:', messages);
                setCounter((prevCounter) => prevCounter + 1);
                console.log('Chatbot.tsx Counter after AI Message:', counter);
            })
            .catch((err) => {
                console.log(
                    'Chatbot.tsx Err in getCreateFileVectorization cloud function ',
                    err
                );
            });
    };
    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop =
                messageContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleMicClick = () => {
        console.log('Microphone icon clicked');
    };

    const handleSendMessage = () => {
        if (input.trim() === '') return;

        const newMessage = {
            id: counter,
            sender: 'user',
            text: input,
        };
        console.log('User Message', newMessage);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setCounter((prevCounter) => prevCounter + 1);
        getResponse(input);

        setInput('');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };
    const handleResetChat = () => {
        setMessages([]);
    };
    const handleDownload = () => {
        const chatContent = messages
            .map((message) => {
                const sender = message.sender === 'user' ? 'User' : 'Bot';
                return `[${sender}]: ${message.text}\n`;
            })
            .join('');

        const blob = new Blob([chatContent], { type: 'text/plain' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chat.txt';

        document.body.appendChild(a);
        a.click();

        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };
    return (
        <Box className={classes.root}>
            <TopBar
                toggleChatVisibility={toggleChatVisibility}
                handleResetChat={handleResetChat}
                handleDownload={handleDownload}
                chatStarted
            />

            <Paper className={classes.paperStyle}>
                <Box
                    ref={messageContainerRef}
                    className={classes.messageContainer}
                >
                    {messages.map((message, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: 'flex',
                                justifyContent:
                                    message.sender === 'user'
                                        ? 'flex-end'
                                        : 'flex-start',
                                marginTop: '6px',
                            }}
                        >
                            <Box
                                className={
                                    message.sender === 'user'
                                        ? classes.senderMessageStyles
                                        : classes.messageStyle
                                }
                            >
                                {message.text}
                            </Box>
                        </Box>
                    ))}
                </Box>
                <Box className={classes.textFieldContainer}>
                    <TextField
                        placeholder="Type a message"
                        sx={{
                            border: 'none',
                            '& fieldset': { border: 'none' },
                        }}
                        fullWidth
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        InputProps={{
                            endAdornment: (
                                <Icons
                                    handleMicClick={handleMicClick}
                                    handleSendMessage={handleSendMessage}
                                />
                            ),
                        }}
                    />
                </Box>
            </Paper>
        </Box>
    );
};

export default Chatbot;
