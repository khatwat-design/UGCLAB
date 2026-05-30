FROM node:22-alpine AS base

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

EXPOSE 3000

USER node

CMD ["npm", "start"]

FROM base AS dev
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]
