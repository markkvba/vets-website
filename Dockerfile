# based on https://github.com/nodejs/docker-node/blob/master/4.7/slim/Dockerfile

FROM node:8

# Match the jenkins uid/gid on the host (504)
RUN groupadd --gid 504 jenkins \
  && useradd --uid 504 --gid jenkins --shell /bin/bash --create-home jenkins

ENV YARN_VERSION 1.12.3
ENV NODE_ENV production

RUN apt-get update && apt-get install -y netcat \
  && apt-get install -y --no-install-recommends gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 \
                                                libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 \
                                                libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 \
                                                libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 \
                                                libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 \
                                                libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates \
                                                fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget \
                                                x11vnc x11-xkb-utils xfonts-100dpi xfonts-75dpi xfonts-scalable \
                                                xfonts-cyrillic x11-apps xvfb \
  && npm install -g yarn@$YARN_VERSION \
  && npm install -g s3-cli \
  && npm install -g codeclimate-test-reporter \
  && chmod +x /usr/local/lib/node_modules/yarn/bin/yarn.js

RUN mkdir -p /application

WORKDIR /application

USER jenkins
