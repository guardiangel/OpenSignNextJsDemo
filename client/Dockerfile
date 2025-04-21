FROM node:20.18.0
WORKDIR /app
COPY package.json .
RUN yarn install --force
COPY . .
EXPOSE 3000
CMD ["yarn","dev"]