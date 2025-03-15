# Build Stage: TypeScript + Webpack
FROM node:23.9.0-alpine3.21 AS web-builder

WORKDIR /app/

VOLUME /app/dist/

# Install dependencies and build
COPY ./package*.json ./

RUN npm clean-install

COPY ./ ./

#RUN npm run build

COPY ./public/ /app/dist/

CMD npm run build:dev
