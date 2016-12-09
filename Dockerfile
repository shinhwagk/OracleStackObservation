FROM node:latest

RUN npm i -g yarn

RUN mkdir -p workfolder/front
WORKDIR workfolder/front

# clean docker cache when package.json update 
ADD package.json .
RUN yarn install

# clean docker cache when app code update
ADD webpack.config.js     .
ADD tsconfig.json         .
ADD webpack.template.html .
ADD styles.css            .
ADD app                   app

RUN yarn run webpack