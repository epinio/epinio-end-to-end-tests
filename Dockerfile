FROM cypress/base:16.13.0

COPY cypress.config.ts .
COPY tsconfig.json .
COPY package.json .
COPY ./cypress/ cypress

RUN npm install

ENTRYPOINT ["npx", "cypress", "run", "--config-file"]
