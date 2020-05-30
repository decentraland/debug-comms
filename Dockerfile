FROM node:14

WORKDIR /app
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm install

COPY index.ts /app/index.ts
COPY tsconfig.json /app/tsconfig.json
RUN npm run build

ENTRYPOINT entrypoint.sh
