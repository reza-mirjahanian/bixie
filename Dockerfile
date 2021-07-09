FROM library/node:14.17.2-alpine

ENV SERVICE_HOME_DIR=/app \
    SERVICE_USER=bixie-test \
    SERVICE_GROUP=bixie-test \
    CACHE_SERVER_HOST= \
    CACHE_SERVER_PORT= \
    LOG_HOST= \
    LOG_FACILITY='reza/bixie-test' \
    NODE_ENV='production'

COPY . ${SERVICE_HOME_DIR}
WORKDIR ${SERVICE_HOME_DIR}

RUN set -x \
 && apk add --no-cache --virtual \
      --update-cache --repository http://dl-3.alpinelinux.org/alpine/edge/testing/ --allow-untrusted \
      git \
      gosu \
      openssh-client \
 && addgroup -S "${SERVICE_GROUP}" \
 && adduser -h "${SERVICE_HOME_DIR}" \
            -g "Service,,,," \
            -s /bin/false \
            -G "${SERVICE_GROUP}" \
            -S -D "${SERVICE_USER}" \
 && chown -R "${SERVICE_USER}:${SERVICE_GROUP}" \
      "${SERVICE_HOME_DIR}" \
 && gosu "${SERVICE_USER}:${SERVICE_GROUP}" sh -c "\
      set -x \
      && mkdir .ssh \
      && chmod 700 .ssh \
      && npm install \
      && chmod +x docker-entrypoint.sh\
      && rm -R .ssh \
    " \
 && mv docker-entrypoint.sh /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
STOPSIGNAL SIGINT
EXPOSE 3000
