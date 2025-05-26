FROM alpine:3.21.3 AS build

# curl 8.13.0
RUN apk add --no-cache perl build-base openssl-dev openssl-libs-static clang zlib-static
RUN wget -qO- https://curl.se/download/curl-8.13.0.tar.gz | tar xzf - && \
	cd *curl* && \
	export CC=clang LDFLAGS="-static" PKG_CONFIG="pkg-config --static" && \
	./configure \
		--enable-static \
		--disable-shared \
		--disable-ldap \
		--disable-docs \
		--disable-manual \
		--disable-unix-sockets \
		--disable-ipv6 \
		--with-ssl \
		--without-libpsl \
		--without-libssh2 \
		&& \
	make -j V=1 CC=clang LDFLAGS="-static -all-static" && \
	strip ./src/curl && \
	ls -lah src/curl && \
	file src/curl && \
	{ ldd src/curl && exit 1 || true; } && \
	./src/curl -V && \
	make -j install V=1 CC=clang LDFLAGS="-static -all-static"

# sudo replacement that allows for use with init systems
COPY ./execsudo.c /execsudo.c
RUN clang -static /execsudo.c -o /execsudo && \
	strip /execsudo && \
	ls -lah /execsudo && \
	file /execsudo && \
	{ ldd /execsudo && exit 1 || true; }

FROM scratch
COPY --from=build --chmod=555 /usr/local/bin/curl /curl
COPY --from=build --chmod=555 /execsudo /execsudo
