#!/bin/sh

docker exec -it backend sh -c '
	apk -e info sqlite || apk add --no-cache sqlite 1>/dev/null
	printf "ID: "
	sqlite3 drizzle/db.sqlite "select * from users;" | tail -1 | cut -d\| -f1
	printf "Username: "
	sqlite3 drizzle/db.sqlite "select * from users;" | tail -1 | cut -d\| -f2
	printf "TOTP Secret: "
	sqlite3 drizzle/db.sqlite "select * from users;" | tail -1 | cut -d\| -f5
	printf "Temporary TOTP Secret: "
	sqlite3 drizzle/db.sqlite "select * from users;" | tail -1 | cut -d\| -f6
	printf "TOTP enabled: "
	sqlite3 drizzle/db.sqlite "select * from users;" | tail -1 | cut -d\| -f7
	printf "Temporary Code $(date +%FT%R):\n"
	node -e '\''
		const speakeasy = require("speakeasy");
		console.log(speakeasy.totp({
			secret: `'\''"
				$(sqlite3 drizzle/db.sqlite '\''select * from users;'\'' | tail -1 | cut -d\| -f6)
			"'\''`.trim(),
			encoding: "base32"
		}));
	'\''
	printf "Current Code $(date +%FT%R):\n"
	node -e '\''
		const speakeasy = require("speakeasy");
		console.log(speakeasy.totp({
			secret: `'\''"
				$(sqlite3 drizzle/db.sqlite '\''select * from users;'\'' | tail -1 | cut -d\| -f5)
			"'\''`.trim(),
			encoding: "base32"
		}));
	'\''
'
