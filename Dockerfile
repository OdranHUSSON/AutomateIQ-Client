FROM node:19

WORKDIR /app

COPY package.json /app/package.json
RUN ls
RUN npm install

EXPOSE 4000

CMD ["npm", "run", "start"]
