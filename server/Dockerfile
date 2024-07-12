FROM node:20
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build
EXPOSE 3000
WORKDIR /usr/src/app/dist
RUN apt-get update \
    && apt-get install -y --no-install-recommends openjdk-17-jdk unzip wget \
    && rm -rf /var/lib/apt/lists/*
RUN wget https://github.com/NationalSecurityAgency/ghidra/releases/download/Ghidra_11.1.1_build/ghidra_11.1.1_PUBLIC_20240614.zip -O ghidra.zip \
    && unzip ghidra.zip \
    && rm ghidra.zip \
    && mv ghidra_* ghidra
ENV GHIDRA_INSTALL_PATH=/usr/src/app/dist/ghidra
CMD [ "node", "src/app.js" ]
