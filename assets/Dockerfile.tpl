FROM nginx

# RUN rm -f /etc/nginx/conf.d/default.conf

# WORKDIR /var/www/html
# COPY index.html /var/www/html
# RUN chmod 755 /var/www/html/index.html

COPY .temp/nginx.conf /etc/nginx/conf.d/

#-certs-#

COPY .temp/ssl/localhost-key.pem /etc/nginx/
COPY .temp/ssl/localhost-cert.pem /etc/nginx/

COPY .temp/nginx.conf /etc/nginx/

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]