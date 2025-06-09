# Use an official lightweight Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
# This leverages Docker's layer caching. This step will only be re-run
# if these files change.
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Your app binds to port 3000, so we expose it
EXPOSE 3000

# Define the command to run your app
CMD [ "node", "server.js" ]
