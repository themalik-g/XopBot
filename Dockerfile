FROM quay.io/astrofx011/docker
RUN git clone https://github.com/EX-BOTS/Zenon-bot /root/bot
WORKDIR /root/bot
RUN npm install
EXPOSE 9000
CMD ["npm", "start"]