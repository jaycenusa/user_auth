# get from official node image
FROM node:20-slim AS build 

# set working directory
WORKDIR /app

# copy package.json and package-lock.json
COPY package*.json ./

# install dependencies
RUN npm install

# copy the rest of the application code
COPY . .

RUN npm run build

# final stage
FROM node:20-slim AS run

# Copy built assets from build stage 
RUN mkdir -p /opt/app && chown node:node /opt/app
WORKDIR /opt/app

# Copy the built app from build stage (includes server.js, public/, node_modules, etc.)
COPY --from=build /app/dist /opt/app
COPY --from=build /app/node_modules /opt/app/node_modules
COPY --from=build /app/server.js /opt/app/server.js
COPY --from=build /app/config /opt/app/config
COPY --from=build /app/middleware /opt/app/middleware
COPY --from=build /app/model /opt/app/model
COPY --from=build /app/routes /opt/app/routes
COPY --from=build /app/controllers /opt/app/controllers
COPY --from=build /app/views /opt/app/views

# Expose the port the app listens on
EXPOSE 3500

USER node

# start the application
CMD ["node", "server.js"]
