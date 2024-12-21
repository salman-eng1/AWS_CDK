#!/bin/bash

sudo su
yum update -y

yum install -y nginx
systemctl restart nginx
systemctl enable nginx

chmod 2775 /usr/share/nginx/html

find /usr/share/nginx/html -type d chmod 2775 {} \;
find /usr/share/nginx/html -type f chmod 0664 {} \;
echo "<h1> test web server </h1>" > /usr/share/nginx/html/index.html