OpenSign PDF Editing Demo

This is a demo project for PDF editing using Next.js, NestJS, MongoDB, Docker, and the Parse Library.

👉 For more details, please refer to the original repository:
https://github.com/OpenSignLabs/OpenSign

🚀 Getting Started

1.Navigate to the client directory and rename env.local to .env.local.

2.Navigate to the server directory and rename env to .env.

3.Set the appropriate values for SMTP_USER_EMAIL and SMTP_PASS in the .env file.
(These credentials can be obtained from your Google account.)

4.From the root directory (OpenSignNextJsDemo in the case), start the application with the following command (assuming yarn is installed)

docker compose up --force-recreate

☁️Azure File Storage Support (Optional)
This app supports Azure Blob Storage. To enable it, follow these steps:

Set the following environment variables:

1.Set up the below content:

AZURE_CONNECTION=''
CONTAINER_NAME=''
BLOB_URL_PREFIX=''

2.Assign a valid value to this fileAdapterId_common in the Utils.tsx (currently undefined)

3.Assign a valid value to this fileAdapterId_common in the UtilsForOpenSign.ts (currently undefined)

📝 Usage Instructions

1.Add an admin user
![alt text](image.png)
2.Login
![alt text](image-1.png)
3.Self signature
![alt text](image-2.png)
![alt text](image-3.png)
![alt text](image-4.png)
4.Request Signature  
![alt text](image-5.png)
![alt text](image-6.png)
![alt text](image-8.png)
![alt text](image-7.png)
![alt text](image-11.png)
![alt text](image-9.png)
![alt text](image-10.png)
![alt text](image-11.png)
5.View the documents
![alt text](image-12.png)
6.Chat with AI tool
![alt text](image-13.png)

Note: If you want to use the ai chatbot tool, please apply it on pinecone website for test purpose.  
#Fill in PINECONE_API_KEY/OPENAI_TEXT_EMBEDDING_MODEL/PINECONE_ENVIRONMENT  
#ai chatbot  
LLAMA_CLOUD_API_KEY=''  
OPENAI_API_KEY=''  
#PINECONE_API_KEY=''  
PINECONE_API_KEY=''  
OPENAI_TEXT_EMBEDDING_MODEL='text-embedding-3-small'  
PINECONE_ENVIRONMENT=''  

I hope this can help everyone who needs it, and if you like, please star ⭐ the original repository:https://github.com/OpenSignLabs/OpenSign
