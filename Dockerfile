# syntax=docker/dockerfile:1

FROM node:16.0.0
ENV NODE_ENV=production

WORKDIR /library-management-back

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .

CMD [ "node", "./bin/www" ]