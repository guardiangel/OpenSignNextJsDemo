FROM node:20.18.0
WORKDIR /app
COPY package.json .

ARG NEXT_PUBLIC_XParseApplicationId
ARG NEXT_PUBLIC_XParseMasterKey
ARG NEXT_PUBLIC_OpenSignServerURL

ENV NEXT_PUBLIC_XParseApplicationId=$NEXT_PUBLIC_XParseApplicationId
ENV NEXT_PUBLIC_XParseMasterKey=$NEXT_PUBLIC_XParseMasterKey
ENV NEXT_PUBLIC_OpenSignServerURL=$NEXT_PUBLIC_OpenSignServerURL

RUN yarn install --force
COPY . .
EXPOSE 3000
CMD ["yarn","dev"]