FROM node:18
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Create app directory
WORKDIR .

COPY apps/omni/package.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install

# Bundle app source
COPY apps/omni/. .
RUN pnpm run build

CMD [ "pnpm", "start" ]
