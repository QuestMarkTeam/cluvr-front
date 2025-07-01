# Node.js 18 이미지 사용
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 설치
COPY package.json package-lock.json ./
RUN npm install

# 앱 소스 복사
COPY . .

# React 앱 빌드
RUN npm run build

# Nginx 설치 (정적 파일 서빙)
FROM nginx:alpine

# 빌드된 React 앱을 Nginx로 서빙
COPY --from=0 /app/build /usr/share/nginx/html

# 포트 80으로 서비스 실행
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
