FROM node:22-alpine AS build
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci 2>/dev/null || npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build && npm prune --omit=dev && npx prisma generate

FROM node:22-alpine AS runner
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json ./
COPY --from=build /app/package-lock.json* ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && chown -R node:node /app

USER node
EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
