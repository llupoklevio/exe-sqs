FROM node:24 AS build

WORKDIR /app

# Install root packages dependencies
COPY package*.json ./

# Install package json dependencies for workspaces
COPY ./esercizio1/package*.json ./esercizio1/
COPY ./cli/package*.json ./cli/
 
RUN npm ci

# Install package config dependencies for root and workspaces
COPY tsconfig.json ./
COPY tsconfig-base.json ./
COPY ./esercizio1/tsconfig.json ./esercizio1/
COPY ./cli/tsconfig.json ./cli/

# Install package src dependencies for workspace esercizio1
COPY ./esercizio1/src ./esercizio1/src
COPY ./cli/src ./cli/src

RUN npm run build 

FROM node:24 AS run

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY esercizio1/package*.json ./esercizio1/
COPY cli/package*.json ./cli/
RUN npm ci --omit=dev

COPY --from=build /app/esercizio1/dist ./esercizio1/dist
COPY --from=build /app/cli/dist ./cli/dist

COPY --chmod=755 docker-entrypoint.sh /usr/local/bin/

USER node
ENTRYPOINT ["docker-entrypoint.sh"]
