#!/bin/bash

# Update and install Nginx
yum update -y
yum install -y nginx

# Start and enable Nginx
systemctl restart nginx
systemctl enable nginx

# Set permissions for the Nginx HTML directory
chmod 2775 /usr/share/nginx/html
find /usr/share/nginx/html -type d -exec chmod 2775 {} \;
find /usr/share/nginx/html -type f -exec chmod 0664 {} \;

# Create a test web page
echo "<h1>Test Web Server 2</h1>" > /usr/share/nginx/html/index.html
