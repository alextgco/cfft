#!/bin/bash
chmod 755 ./cgi-bin
find ./cgi-bin/ -type f | xargs chmod 755 *
chmod 755 ./cgi-bin-skd
find ./cgi-bin-skd -type f | xargs chmod 755 *
chmod 755 ./public_html
find ./public_html/ -type d -exec chmod 0755 '{}' \;
find ./public_html/ -type f -exec chmod 0644 '{}' \; 
