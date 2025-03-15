FROM node:23.9.0-alpine3.21 AS builder

WORKDIR /app

# Docker compose env needs to be manually set at build stage
ENV NODE_ENV=${NODE_ENV}

COPY ./package*.json ./

### RUN npm install
RUN npm install --production

COPY . .
### RUN npm run build

### FROM node:23.9.0-alpine3.21

# Install build dependencies for bcrypt and other native modules
### RUN apk add --no-cache --virtual .build-deps \
###     python3 \
###     make \
###     g++ \
###     && apk add --no-cache --update bash \
###     && apk del .build-deps

### WORKDIR /app

# Copy package files to install dependencies first
### COPY ./package*.json ./
### COPY --from=builder /app/dist /app/dist
### COPY --from=builder /app/drizzle /app/drizzle

### RUN npm install --production

CMD if [ "$WATCH" = "0" ]; then \
		npm run build && \
		npm start; \
	else \
		npm run start:dev; \
	fi
