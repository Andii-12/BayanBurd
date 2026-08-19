FROM node:20-alpine
WORKDIR /app

COPY package.json tsconfig.json ./
COPY vendor ./vendor
COPY src ./src

RUN npm pkg set dependencies.@bbe/types=file:./vendor/types dependencies.@bbe/validation=file:./vendor/validation \
  && npm install \
  && npx tsc -p vendor/types/tsconfig.json \
  && npx tsc -p vendor/validation/tsconfig.json \
  && npx tsc -p tsconfig.json

ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/index.js"]
