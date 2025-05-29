FROM node:23.9.0-alpine3.21

WORKDIR /backend/

RUN apk add --no-cache curl

COPY ./package*.json ./
COPY --chmod=555 ./healthcheck.sh /healthcheck.sh

RUN npm clean-install

COPY . .

ENV WATCH=0

CMD ["sh", "-c", "if [ \"$WATCH\" = \"0\" ]; then npm run build && npm start; else npm run start:dev; fi"]

HEALTHCHECK --interval=20s --timeout=4s --start-period=180s --start-interval=2s --retries=5 CMD ["/healthcheck.sh"]
