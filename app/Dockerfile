# Build Stage: TypeScript + Webpack
FROM node:23.9.0-alpine3.21

WORKDIR /app/

VOLUME /app/dist/

# Install dependencies and build
COPY ./package*.json ./

RUN npm clean-install

COPY ./ ./

COPY ./src/public ./dist
COPY ./src/assets ./dist/assets

RUN npm run build

ENV WATCH 0

CMD if [ "$WATCH" = "1" ]; then npm run build:dev; fi
