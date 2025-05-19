FROM node:23.9.0-alpine3.21

WORKDIR /backend/

RUN apk add --no-cache curl

COPY ./package*.json ./

RUN npm clean-install

COPY . .

ENV WATCH=0

HEALTHCHECK --interval=10s --timeout=2s --start-period=75s --start-interval=1s --retries=3 \
  CMD curl --fail --no-progress-meter http://localhost:${BACKEND_PORT}/healthcheck

CMD ["sh", "-c", "if [ \"$WATCH\" = \"0\" ]; then npm run build && npm start; else npm run start:dev; fi"]
