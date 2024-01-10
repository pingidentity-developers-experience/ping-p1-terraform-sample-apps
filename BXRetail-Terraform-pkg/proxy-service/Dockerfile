
FROM node:lts-alpine as builder

LABEL version="0.0.4"
LABEL description="Example Fastify (Node.js) webapp Docker Image"
LABEL maintainer="Chris Price <cprice@pingidentity.com>"

# update packages, to reduce risk of vulnerabilities
RUN apk update && apk upgrade

# set a non privileged user to use when running this image
USER node
# set right (secure) folder permissions
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

# set default node env
ARG NODE_ENV=development
# ARG NODE_ENV=production
# to be able to run tests (for example in CI), do not set production as environment
ENV NODE_ENV=${NODE_ENV}

ENV NPM_CONFIG_LOGLEVEL=warn

# copy project definition/dependencies files, for better reuse of layers
COPY --chown=node:node src/package*.json ./

# install dependencies here, for better reuse of layers
RUN npm install && npm audit fix && npm cache clean --force

# copy all sources in the container (exclusions in .dockerignore file)
COPY --chown=node:node . .

# exposed ports
EXPOSE 4000

# ENTRYPOINT [ "node" ]
# CMD [ "npm", "start" ]
CMD [ "node", "./src/server" ]

# end.