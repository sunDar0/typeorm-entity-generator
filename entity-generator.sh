#!/bin/bash
echo "===================== 디비 모델 entity 가져오기 ====================="
echo "================ Start docker container deploy process ================"
echo "---------------- docker images build ----------------"
#도커 이미지 빌드
docker build -t entity-generator:latest .

#기존 도커 컨테이너 정지
docker stop entity-generator

# 기존 도커 컨테이너 이미지 변경
backupName="back-entity-generator`date +%s`"

# 기존 도커 컨테이너 리네임
docker rename entity-generator $backupName

echo "---------------- docker container run ----------------"

#신규 도커 컨테이너 실행
docker run -d -v `pwd`/output/:/app/src/entities --name entity-generator entity-generator:latest  

# #기존 도커 삭제
docker rm $backupName

# #사용하지 않는 도커 컨테이너 제거
docker container prune -f

#사용하지 않는 도커 이미지 제거
docker image prune -a -f

# echo "---------------- docker monitoring [CPU] [UsageMemory] ----------------"
# echo "---------------- If you want quit docker monitoring press the 'Ctrl + c' ----------------"

# docker stats --format "table {{.Name}}\t{{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
