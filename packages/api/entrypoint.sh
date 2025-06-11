#!/bin/sh
# entrypoint.sh

# Default to 'uat' if DEPLOY_ENV is not set
DEPLOY_ENV=${DEPLOY_ENV:-uat}

if [ "$DEPLOY_ENV" = "production" ]; then
    echo "Loading production environment..."
    exec bun run --env-file=.env.production src/index.ts
elif [ "$DEPLOY_ENV" = "uat" ]; then
    echo "Loading UAT environment..."
    exec bun run --env-file=.env.uat src/index.ts
else
    echo "Unknown environment: $DEPLOY_ENV"
    exit 1
fi