@echo off
pm2 start ecosystem.config.js
pm2 save
pause