FROM node:latest

RUN mkdir -p workfolder
WORKDIR workfolder

# clean docker cache when package.json update 
ADD package.json .
RUN npm i --registry=https://registry.npm.taobao.org

# clean docker cache when app code update
ADD tsconfig.json       .
ADD systemjs.config.js  .
ADD index.html          .
ADD styles.css          .
ADD app                 app

RUN npm run wbpack
