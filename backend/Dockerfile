FROM node:23.9.0-alpine3.21

WORKDIR /backend/

RUN apk add --no-cache curl

COPY ./package*.json ./

RUN npm clean-install

COPY . .

ENV WATCH=0

# Use a script to customize port?
HEALTHCHECK --interval=5s --timeout=5s --retries=5 \
  CMD curl --fail http://localhost:${BACKEND_PORT}/healthcheck || exit 1

CMD ["sh", "-c", "if [ \"$WATCH\" = \"0\" ]; then npm run build && npm start; else npm run start:dev; fi"]