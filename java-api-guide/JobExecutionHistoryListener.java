package com.yourcompany.scheduler.listener;

import org.quartz.*;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * Quartz JobListener - Job 실행 이력을 메모리에 저장한다.
 * Quartz Scheduler에 addJobListener() 로 등록한다.
 *
 * 주의: RAMJobStore 사용 시 애플리케이션 재시작 시 이력이 초기화된다.
 *       영속화가 필요하면 DB에 저장하도록 수정한다.
 */
public class JobExecutionHistoryListener implements JobListener {

    private static final int MAX_HISTORY = 500;

    // 싱글톤 인스턴스 (Spring Bean으로 관리하는 경우 제거)
    private static final JobExecutionHistoryListener INSTANCE = new JobExecutionHistoryListener();

    private final Deque<ExecutionRecord> history = new ConcurrentLinkedDeque<>();

    public static JobExecutionHistoryListener getInstance() {
        return INSTANCE;
    }

    @Override
    public String getName() {
        return "executionHistoryListener";
    }

    @Override
    public void jobToBeExecuted(JobExecutionContext context) {
        ExecutionRecord record = new ExecutionRecord();
        record.id = UUID.randomUUID().toString();
        record.jobName = context.getJobDetail().getKey().getName();
        record.jobGroup = context.getJobDetail().getKey().getGroup();
        record.startTime = new Date();
        // context에 임시 저장 (jobWasExecuted에서 참조)
        context.put("_historyRecord", record);
    }

    @Override
    public void jobExecutionVetoed(JobExecutionContext context) {
        // 실행 거부된 경우 임시 기록 제거
        context.put("_historyRecord", null);
    }

    @Override
    public void jobWasExecuted(JobExecutionContext context, JobExecutionException jobException) {
        ExecutionRecord record = (ExecutionRecord) context.get("_historyRecord");
        if (record == null) return;

        record.endTime = new Date();
        record.durationMs = record.endTime.getTime() - record.startTime.getTime();
        record.success = (jobException == null);
        record.errorMessage = (jobException != null) ? jobException.getMessage() : null;

        history.addFirst(record);
        // 최대 개수 초과 시 오래된 항목 제거
        while (history.size() > MAX_HISTORY) {
            history.pollLast();
        }
    }

    public List<ExecutionRecord> getAll() {
        return new ArrayList<>(history);
    }

    public List<ExecutionRecord> getRecent(int limit) {
        List<ExecutionRecord> all = getAll();
        return all.subList(0, Math.min(limit, all.size()));
    }

    public List<ExecutionRecord> getByJob(String group, String name) {
        List<ExecutionRecord> result = new ArrayList<>();
        for (ExecutionRecord r : history) {
            if (r.jobGroup.equals(group) && r.jobName.equals(name)) {
                result.add(r);
            }
        }
        return result;
    }

    // ---- 내부 데이터 클래스 ----
    public static class ExecutionRecord {
        public String id;
        public String jobName;
        public String jobGroup;
        public Date startTime;
        public Date endTime;
        public Long durationMs;
        public boolean success;
        public String errorMessage;
    }
}
