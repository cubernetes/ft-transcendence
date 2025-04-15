FROM node:23.9.0-alpine3.21

WORKDIR /frontend/

VOLUME /frontend/dist/

COPY ./package*.json ./

RUN npm clean-install

COPY ./ ./

ARG LIVE_RELOAD_PORT
ENV LIVE_RELOAD_PORT=${LIVE_RELOAD_PORT}

RUN npm run build

ENV WATCH=0

CMD ["sh", "-c", "if [ \"$WATCH\" = \"1\" ]; then npm run build:dev; fi"]