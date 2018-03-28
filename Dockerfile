FROM node:9.9.0
RUN mkdir /proxy

WORKDIR /proxy

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000
CMD ["node", "server.js"]
