package com.yourcompany.ifclient.service;

import java.util.List;
import java.util.Map;

/**
 * I/F Client 모니터링 서비스 인터페이스.
 *
 * 기존 스케줄러 데몬의 서비스/DAO 레이어를 활용해 구현한다.
 * 각 메서드의 반환값은 Jackson이 JSON으로 직렬화한다.
 */
public interface IFClientMonitorService {

    /**
     * Client 전체 상태 반환.
     * @return {
     *   status: "RUNNING" | "STOPPED" | "ERROR",
     *   startTime: "2024-01-01T09:00:00.000+0900",  // ISO 8601
     *   uptimeSeconds: 3600,
     *   totalErrorCount: 5
     * }
     */
    Map<String, Object> getClientStatus();

    /**
     * SEND 방향 테이블별 요약 목록.
     * @return [ {
     *   tableName: "IF_ORDER",
     *   lastSyncTime: "2024-01-01T09:00:00.000+0900" | null,
     *   errorCount: 3,
     *   pendingCount: 1,
     *   hasError: true
     * }, ... ]
     */
    List<Map<String, Object>> getSendSummary();

    /**
     * FETCH 방향 테이블별 요약 목록 (pendingCount 불필요).
     */
    List<Map<String, Object>> getFetchSummary();

    /** SEND 테이블 이름 목록 */
    List<String> getSendTableNames();

    /** FETCH 테이블 이름 목록 */
    List<String> getFetchTableNames();

    /**
     * 특정 테이블의 SEND 에러 Row 목록.
     * data 필드에 실제 컬럼 데이터를 Map으로 담는다 (Dynamic 컬럼 지원).
     * @return [ {
     *   id: "uuid",
     *   tableName: "IF_ORDER",
     *   errorFlag: "E001",
     *   errorMessage: "Connection timeout",
     *   status: "ERROR" | "PENDING",
     *   createdAt: "2024-01-01T09:00:00.000+0900",
     *   data: { ORDER_ID: "1234", ORDER_AMT: "50000", ... }
     * }, ... ]
     */
    List<Map<String, Object>> getSendErrors(String tableName);

    /**
     * 에러 Row 재전송.
     * tableNames: 해당 테이블의 모든 에러 재전송
     * ids: 특정 Row id 재전송
     * @return { successCount: 5, failCount: 0, message: "완료" }
     */
    Map<String, Object> retransmit(List<String> tableNames, List<String> ids);

    /**
     * FETCH 수신 데이터 조회.
     * from/to: ISO 8601 문자열
     * @return [ {
     *   id: "uuid",
     *   tableName: "IF_STOCK",
     *   receivedAt: "2024-01-01T09:00:00.000+0900",
     *   data: { ITEM_CD: "ABC", QTY: "100", ... }
     * }, ... ]
     */
    List<Map<String, Object>> getFetchData(String tableName, String from, String to);
}
