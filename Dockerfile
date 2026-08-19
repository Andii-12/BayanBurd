FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
COPY packages/validation/package.json ./packages/validation/

RUN npm ci

COPY packages ./packages
COPY apps/api ./apps/api

RUN npm run build:api

ENV NODE_ENV=production
WORKDIR /app/apps/api
EXPOSE 4000
CMD ["node", "dist/index.js"]
