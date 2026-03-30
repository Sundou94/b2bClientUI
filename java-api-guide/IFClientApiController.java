package com.yourcompany.ifclient.web.controller;

import com.yourcompany.ifclient.service.IFClientMonitorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * I/F Client 모니터링 REST API Controller
 *
 * Spring Framework 2.5+ : @Controller + @ResponseBody 방식
 * Spring 3.0+ 환경이라면 @RestController 교체 가능
 *
 * 의존성 (build.gradle):
 *   implementation 'com.fasterxml.jackson.core:jackson-databind:2.17.0'
 *
 * Spring XML 설정 (dispatcher-servlet.xml):
 *   <mvc:annotation-driven />
 *   <context:component-scan base-package="com.yourcompany.ifclient.web" />
 */
@Controller
@RequestMapping("/api")
public class IFClientApiController {

    @Autowired
    private IFClientMonitorService monitorService;

    // =========================================================
    // GET /api/client/status
    // 응답: { status, startTime, uptimeSeconds, totalErrorCount }
    // =========================================================
    @RequestMapping(value = "/client/status", method = RequestMethod.GET)
    @ResponseBody
    public Map<String, Object> getClientStatus() {
        return monitorService.getClientStatus();
    }

    // =========================================================
    // GET /api/send/summary
    // 응답: [ { tableName, lastSyncTime, errorCount, pendingCount, hasError }, ... ]
    // =========================================================
    @RequestMapping(value = "/send/summary", method = RequestMethod.GET)
    @ResponseBody
    public List<Map<String, Object>> getSendSummary() {
        return monitorService.getSendSummary();
    }

    // =========================================================
    // GET /api/fetch/summary
    // =========================================================
    @RequestMapping(value = "/fetch/summary", method = RequestMethod.GET)
    @ResponseBody
    public List<Map<String, Object>> getFetchSummary() {
        return monitorService.getFetchSummary();
    }

    // =========================================================
    // GET /api/send/tables
    // 응답: [ "TABLE_A", "TABLE_B", ... ]
    // =========================================================
    @RequestMapping(value = "/send/tables", method = RequestMethod.GET)
    @ResponseBody
    public List<String> getSendTables() {
        return monitorService.getSendTableNames();
    }

    // =========================================================
    // GET /api/fetch/tables
    // =========================================================
    @RequestMapping(value = "/fetch/tables", method = RequestMethod.GET)
    @ResponseBody
    public List<String> getFetchTables() {
        return monitorService.getFetchTableNames();
    }

    // =========================================================
    // GET /api/send/errors?tableName=xxx
    // 응답: [ { id, tableName, errorFlag, errorMessage, status, createdAt,
    //           data: { col1: val1, col2: val2, ... } }, ... ]
    // =========================================================
    @RequestMapping(value = "/send/errors", method = RequestMethod.GET)
    @ResponseBody
    public List<Map<String, Object>> getSendErrors(
            @RequestParam String tableName) {
        return monitorService.getSendErrors(tableName);
    }

    // =========================================================
    // POST /api/send/retransmit
    // 요청 Body: { "tableNames": ["TABLE_A"], "ids": ["id1","id2"] }
    // 응답: { successCount, failCount, message }
    // =========================================================
    @RequestMapping(value = "/send/retransmit", method = RequestMethod.POST)
    @ResponseBody
    public Map<String, Object> retransmit(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<String> tableNames = (List<String>) request.get("tableNames");
        @SuppressWarnings("unchecked")
        List<String> ids = (List<String>) request.get("ids");
        return monitorService.retransmit(tableNames, ids);
    }

    // =========================================================
    // GET /api/fetch/data?tableName=xxx&from=xxx&to=xxx
    // 응답: [ { id, tableName, receivedAt, data: { col1: val1, ... } }, ... ]
    // =========================================================
    @RequestMapping(value = "/fetch/data", method = RequestMethod.GET)
    @ResponseBody
    public List<Map<String, Object>> getFetchData(
            @RequestParam String tableName,
            @RequestParam String from,
            @RequestParam String to) {
        return monitorService.getFetchData(tableName, from, to);
    }
}
