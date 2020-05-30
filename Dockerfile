FROM node:14

RUN mkdir /graphviz && \
  apk add --update graphviz font-bitstream-type1 ghostscript-fonts && \
  rm -rf /var/cache/apk/*

WORKDIR /app
COPY package.json /tmp/package.json
COPY package-lock.json /tmp/package-lock.json
RUN npm install

COPY index.ts .
COPY tsconfig.json .
RUN npm build

ENTRYPOINT entrypoint.sh
