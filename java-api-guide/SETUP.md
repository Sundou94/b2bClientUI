# Java REST API 추가 가이드

## 1. build.gradle 의존성 추가

```groovy
dependencies {
    // JSON 직렬화 (없으면 추가)
    implementation 'com.fasterxml.jackson.core:jackson-databind:2.17.0'

    // Spring MVC (이미 있을 경우 생략)
    implementation 'org.springframework:spring-webmvc:2.5.6'
}
```

## 2. Spring XML 설정 (dispatcher-servlet.xml)

```xml
<!-- @ResponseBody JSON 변환 활성화 -->
<mvc:annotation-driven />

<!-- 컨트롤러 스캔 -->
<context:component-scan base-package="com.yourcompany.ifclient.web" />
```

## 3. web.xml — CORS 필터 및 DispatcherServlet 매핑

```xml
<!-- CORS 필터 -->
<filter>
    <filter-name>corsFilter</filter-name>
    <filter-class>com.yourcompany.ifclient.web.filter.CorsFilter</filter-class>
</filter>
<filter-mapping>
    <filter-name>corsFilter</filter-name>
    <url-pattern>/api/*</url-pattern>
</filter-mapping>

<!-- DispatcherServlet이 /api/* 처리하도록 매핑 확인 -->
<servlet-mapping>
    <servlet-name>dispatcher</servlet-name>
    <url-pattern>/api/*</url-pattern>
</servlet-mapping>
```

## 4. 구현 순서

1. `IFClientMonitorService` 인터페이스를 기존 서비스/DAO 레이어와 연결해 구현
2. `IFClientApiController` + `CorsFilter` 를 프로젝트에 추가
3. Spring XML에 `<mvc:annotation-driven />` 추가
4. 빌드 후 동작 확인:

```bash
curl http://localhost:8080/api/client/status
curl http://localhost:8080/api/send/summary
curl http://localhost:8080/api/fetch/summary
```

## 5. React 웹 실행

```bash
cd c:\AI\b2bClientUI
npm run dev
# 브라우저: http://localhost:5173
```

## 포트가 8080이 아닌 경우

`vite.config.ts`의 proxy target 수정:
```typescript
proxy: {
  '/api': 'http://localhost:실제포트'
}
```

## API 응답 포맷 요약

| Endpoint | 설명 |
|----------|------|
| GET /api/client/status | status, startTime(ISO), uptimeSeconds, totalErrorCount |
| GET /api/send/summary | tableName, lastSyncTime, errorCount, pendingCount, hasError |
| GET /api/fetch/summary | tableName, lastSyncTime, errorCount, hasError |
| GET /api/send/tables | string[] |
| GET /api/fetch/tables | string[] |
| GET /api/send/errors?tableName=xxx | id, tableName, errorFlag, errorMessage, status, createdAt, data:{} |
| POST /api/send/retransmit | Body: {tableNames?, ids?} → successCount, failCount |
| GET /api/fetch/data?tableName=&from=&to= | id, tableName, receivedAt, data:{} |
