FROM node:14

WORKDIR /app
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm install

COPY index.ts /app/index.ts
COPY tsconfig.json /app/tsconfig.json
RUN npm run build

EXPOSE 2500

COPY entrypoint.sh /app/entrypoint.sh
ENTRYPOINT /app/entrypoint.sh
