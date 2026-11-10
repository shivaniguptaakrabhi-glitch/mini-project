FROM node:24.19.0-alpine AS build

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:24.19.0-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]