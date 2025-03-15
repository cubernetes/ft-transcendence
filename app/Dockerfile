# Build Stage: TypeScript + Webpack
FROM node:23.9.0-alpine3.21 AS app-builder

WORKDIR /app/

VOLUME /app/dist/

# Install dependencies and build
COPY ./package*.json ./

RUN npm clean-install

COPY ./ ./

RUN if [ "$WATCH" = "0" ]; then npm run build; fi

#ENV WATCH $WATCH

CMD if [ "$WATCH" = "1" ]; then npm run build:dev; fi
