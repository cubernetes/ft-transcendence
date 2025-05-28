#!/bin/bash

set -e
#set -vx

# set whitelisted env
# For ELASTIC_USER -> MUST be "elastic"! https://discuss.elastic.co/t/how-to-change-the-username-by-own-instead-of-elastic/337552/2
set -- ELASTIC_PASSWORD LOGSTASH_USER LOGSTASH_PASSWORD KIBANA_USER KIBANA_PASSWORD ELASTIC_KEYSTORE_PASS ELASTICSEARCH_HOST ELASTICSEARCH_PORT ELASTIC_USER
whitelisted_env=''
for env_var in "$@"; do
	: "${!env_var:?"Missing $env_var"}"
	whitelisted_env="$whitelisted_env,$env_var"
done
whitelisted_env=${whitelisted_env#,}

# Add elasticsearch bin directory to PATH. This is important for
# the run_as_elastic function, see below.
export PATH="/usr/share/elasticsearch/bin${PATH:+:$PATH}"

/healthcheck.sh

run_as_elastic () {
	# Apparently, su resets PATH no matter if you specify --preserve-environment and or --login or not.
	# We need to explicity pass the current value of PATH (which includes the elasticsearch bin directory)
	# down, using bash's fancy quoting mechanism.
	# The `${*@Q}` thing is just the arguments ($*) properly quoted (@Q). Bash is pretty cool eh?
	su --command="export PATH=${PATH@Q}; ${*@Q}" \
		elasticsearch
}

# Checking if certificates exist
run_as_elastic /usr/share/elasticsearch/config/generate-certs.sh

# Create elasticsearch.keystore and add the keystore password
if [ ! -f "/usr/share/elasticsearch/config/elasticsearch.keystore" ]; then
    echo "Creating elasticsearch.keystore..."

	run_as_elastic /usr/share/elasticsearch/bin/elasticsearch-keystore create
	echo "$ELASTIC_KEYSTORE_PASS" | run_as_elastic /usr/share/elasticsearch/bin/elasticsearch-keystore add xpack.security.transport.ssl.keystore.secure_password
	echo "$ELASTIC_KEYSTORE_PASS" | run_as_elastic /usr/share/elasticsearch/bin/elasticsearch-keystore add xpack.security.transport.ssl.truststore.secure_password
	echo "$ELASTIC_KEYSTORE_PASS" | run_as_elastic /usr/share/elasticsearch/bin/elasticsearch-keystore add xpack.security.http.ssl.keystore.secure_password
	echo "$ELASTIC_KEYSTORE_PASS" | run_as_elastic /usr/share/elasticsearch/bin/elasticsearch-keystore add xpack.security.http.ssl.truststore.secure_password
fi

# Run the setup script as elasticsearch user
run_as_elastic /usr/share/elasticsearch/setup-single-node.sh
