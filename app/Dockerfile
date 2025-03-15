# Build Stage: TypeScript + Webpack
FROM node:23.9.0-alpine3.21 AS web-builder

WORKDIR /app/

VOLUME /app/dist/

# Install dependencies and build
COPY ./package*.json ./

RUN npm clean-install

COPY ./ ./

RUN test "$WATCH" = "0" && npm run build || true

#ENV WATCH $WATCH

CMD test "$WATCH" = "l" && npm run build:dev || true
