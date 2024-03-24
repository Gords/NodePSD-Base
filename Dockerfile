FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm install -g sequelize-cli
EXPOSE 3000
CMD ["npm", "start"]