FROM node:latest

RUN mkdir -p workfolder
WORKDIR workfolder

# clean docker cache when package.json update 
ADD package.json .
RUN yarn install

# clean docker cache when app code update
ADD tsconfig.json       .
ADD systemjs.config.js  .
ADD index.html          .
ADD styles.css          .
ADD app                 app

RUN yarn run webpack