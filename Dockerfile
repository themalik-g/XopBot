# Base Image node bullseye (Debian-based)
FROM node:18-bullseye
ENV SHARP_IGNORE_GLOBAL_LIBVIPS=1
ENV npm_config_arch=x64
ENV npm_config_platform=linux
RUN apt-get update && apt-get install -y \
    tzdata \
    ffmpeg \
    git \
    imagemagick \
    python3 \
    graphicsmagick \
    sudo \
    curl \
    bash \
    libvips-dev
RUN apt-get clean && rm -rf /var/lib/apt/lists/*
RUN git clone https://github.com/AstroAnalytics/XopBot /root/bot
WORKDIR /root/bot
RUN npm cache clean --force && rm -rf node_modules
RUN npm install
EXPOSE 9000
CMD ["npm", "start"]