# 노드 버전 명세
ARG NODE_VERSION=18

# npm 패키지를 모두 설치한 이미지 1개를 생성함
FROM node:${NODE_VERSION}-alpine as installer

RUN apk add tzdata
RUN apk update

# 타임존 추가
ENV TZ=Asia/Seoul

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm;

RUN pnpm install


# 번들링함.
FROM installer as builder
WORKDIR /app

COPY . .
RUN ls -al


# 번들링된 프로젝트를 실행함.
FROM installer
WORKDIR /app

COPY --from=builder /app .
CMD ["pnpm", "start"]

