FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

RUN addgroup -g 1000 helixmonitor && \
    adduser -D -u 1000 -G helixmonitor helixmonitor && \
    chown -R helixmonitor:helixmonitor /app

USER helixmonitor

EXPOSE 5173

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD test -f /app/dist/index.html || exit 1

ENTRYPOINT ["/sbin/dumb-init", "--"]
CMD ["npm", "run", "preview"]
