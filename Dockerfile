FROM cypress/base:16.13.0

COPY cypress.config.ts .
COPY tsconfig.json .
COPY package.json .
COPY ./cypress/ cypress

RUN npm install
RUN apt-get update && apt-get install -y \
    unzip \
&& rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["npx", "cypress", "run", "--config-file"]
