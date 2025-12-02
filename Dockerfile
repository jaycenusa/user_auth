# get from official node image
FROM node:20-slim AS build 

# set working directory
WORKDIR /app

# copy package.json and package-lock.json
COPY package*.json ./

RUN rm -rf node_modules package-lock.json

# install dependencies
RUN npm install

# copy the rest of the application code
COPY . .
# expose port 3000
EXPOSE 3000

USER node

# start the application
CMD ["npm", "start"]
