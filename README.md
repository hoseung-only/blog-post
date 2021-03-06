# post

post service for my personal blog

## Test

First, setup mysql
```
docker pull --platform linux/amd64 mysql:5.7

docker run --platform linux/amd64 --name blog-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=blog -e MYSQL_USER=hsjang -e MYSQL_PASSWORD=password -d mysql:5.7 --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
```

And then run test script
```
npm run test
```

After test finished, remove mysql container
```
docker stop blog-mysql
docker rm blog-mysql
```

## References

- [백엔드 아키텍처](https://miro.com/app/board/o9J_laTyd80=/)
- [데이터베이스 모델링](https://www.erdcloud.com/d/XrM5reMPurCNBreWr)
- [개발 일지](https://velog.io/@alvin/series/%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-Blog)
