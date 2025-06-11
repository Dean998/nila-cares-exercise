FROM oven/bun:1.2.14-alpine as base
WORKDIR /app

FROM base AS install
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY . .
COPY entrypoint.sh .

ENV NODE_ENV=production
# Make the entrypoint script executable
RUN chmod +x entrypoint.sh

# Use the entrypoint script to handle environment selection
ENTRYPOINT ["./entrypoint.sh"]