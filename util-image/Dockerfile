FROM alpine:3.21.3

# curl 8.13.0
RUN apk add --no-cache perl build-base openssl-dev openssl-libs-static
RUN wget -qO- https://curl.se/download/curl-8.13.0.tar.gz | tar xzf - && \
	cd *curl* && \
	LDFLAGS="-static" PKG_CONFIG="pkg-config --static" ./configure --enable-static --disable-shared --disable-ldap  --with-ssl --disable-docs --disable-manual --without-libpsl && \
	make -j LDFLAGS="-static -all-static" && \
	make install

# sudo replacement that allows for use with init systems
COPY ./execsudo.c /execsudo.c
RUN gcc -static /execsudo.c -o /execsudo


FROM scratch
COPY --from=build /usr/local/bin/curl /curl
COPY --from=build /execsudo /execsudo
