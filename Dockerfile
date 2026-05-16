FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app

COPY . /app

RUN apt-get update && apt-get install -y nodejs npm

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
