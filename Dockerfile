FROM node:14

# Install build tools and dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    python

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm install -g sequelize-cli

EXPOSE 3000

CMD ["npm", "start"]