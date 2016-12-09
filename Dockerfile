FROM nginx:latest

WORKDIR /etc/nginx/

ADD nginx.conf .

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]