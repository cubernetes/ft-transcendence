FROM node:23.9.0-alpine3.21

WORKDIR /backend/

COPY ./package*.json ./

RUN npm clean-install

COPY . .

ENV WATCH=0

CMD ["sh", "-c", "if [ \"$WATCH\" = \"0\" ]; then npm run build && npm start; else npm run start:dev; fi"]