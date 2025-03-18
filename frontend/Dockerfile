# Build Stage: TypeScript + Webpack
FROM node:23.9.0-alpine3.21

WORKDIR /frontend/

VOLUME /frontend/dist/

# Install dependencies and build
COPY ./package*.json ./

RUN npm clean-install

COPY ./ ./

#TODO: @timo: remove later, not really needed anymore
#RUN rm -rf ./dist/ && mkdir -p ./dist/ && \
#	ln -sf /frontend/src/public/index.html ./dist/index.html && \
#	ln -sf /frontend/src/public/assets/    ./dist/assets

RUN npm run build

ENV WATCH 0

CMD if [ "$WATCH" = "1" ]; then npm run build:dev; fi
