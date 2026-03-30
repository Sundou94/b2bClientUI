package com.yourcompany.scheduler.web.controller;

import com.yourcompany.scheduler.listener.JobExecutionHistoryListener;
import com.yourcompany.scheduler.listener.JobExecutionHistoryListener.ExecutionRecord;
import org.quartz.*;
import org.quartz.impl.matchers.GroupMatcher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Quartz Scheduler 모니터링 REST API Controller.
 *
 * Spring Framework 2.5+ 기준: @Controller + @ResponseBody 방식 사용.
 * Spring 3.0+ 환경이라면 @RestController로 교체 가능.
 *
 * build.gradle 의존성 추가 (JSON 직렬화):
 *   implementation 'com.fasterxml.jackson.core:jackson-databind:2.x.x'
 *   // 또는
 *   implementation 'com.google.code.gson:gson:2.x.x'
 *
 * Spring XML 설정에 아래를 추가해야 @ResponseBody JSON 변환이 동작한다:
 *   <mvc:annotation-driven />
 */
@Controller
@RequestMapping("/api")
public class SchedulerApiController {

    @Autowired
    private Scheduler scheduler;

    private static final SimpleDateFormat ISO_FORMAT = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ");

    // =========================================================
    // GET /api/scheduler/status
    // =========================================================
    @RequestMapping(value = "/scheduler/status", method = RequestMethod.GET)
    @ResponseBody
    public Map<String, Object> getSchedulerStatus() throws SchedulerException {
        SchedulerMetaData meta = scheduler.getMetaData();
        int totalJobs = 0, pausedJobs = 0, errorJobs = 0, runningJobs = 0;

        for (String group : scheduler.getJobGroupNames()) {
            for (JobKey key : scheduler.getJobKeys(GroupMatcher.jobGroupEquals(group))) {
                totalJobs++;
                List<? extends Trigger> triggers = scheduler.getTriggersOfJob(key);
                for (Trigger trigger : triggers) {
                    Trigger.TriggerState state = scheduler.getTriggerState(trigger.getKey());
                    if (state == Trigger.TriggerState.PAUSED) pausedJobs++;
                    else if (state == Trigger.TriggerState.ERROR) errorJobs++;
                    else if (state == Trigger.TriggerState.BLOCKED) runningJobs++;
                }
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("schedulerName", meta.getSchedulerName());
        result.put("isStarted", meta.isStarted());
        result.put("isStandby", meta.isInStandbyMode());
        result.put("isShutdown", meta.isShutdown());
        result.put("totalJobs", totalJobs);
        result.put("runningJobs", runningJobs);
        result.put("pausedJobs", pausedJobs);
        result.put("errorJobs", errorJobs);
        return result;
    }

    // =========================================================
    // GET /api/jobs
    // =========================================================
    @RequestMapping(value = "/jobs", method = RequestMethod.GET)
    @ResponseBody
    public List<Map<String, Object>> getJobs() throws SchedulerException {
        List<Map<String, Object>> result = new ArrayList<>();
        for (String group : scheduler.getJobGroupNames()) {
            for (JobKey key : scheduler.getJobKeys(GroupMatcher.jobGroupEquals(group))) {
                result.add(buildJobSummary(key));
            }
        }
        return result;
    }

    // =========================================================
    // GET /api/jobs/{group}/{name}
    // =========================================================
    @RequestMapping(value = "/jobs/{group}/{name}", method = RequestMethod.GET)
    @ResponseBody
    public Map<String, Object> getJobDetail(
            @PathVariable String group, @PathVariable String name) throws SchedulerException {
        JobKey key = JobKey.jobKey(name, group);
        JobDetail detail = scheduler.getJobDetail(key);
        if (detail == null) throw new RuntimeException("Job not found: " + group + "/" + name);

        Map<String, Object> result = buildJobSummary(key);

        // jobDataMap
        Map<String, String> dataMap = new LinkedHashMap<>();
        for (String k : detail.getJobDataMap().getKeys()) {
            dataMap.put(k, String.valueOf(detail.getJobDataMap().get(k)));
        }
        result.put("jobDataMap", dataMap);

        // triggers
        List<Map<String, Object>> triggers = new ArrayList<>();
        for (Trigger trigger : scheduler.getTriggersOfJob(key)) {
            triggers.add(buildTriggerInfo(trigger));
        }
        result.put("triggers", triggers);

        return result;
    }

    // =========================================================
    // GET /api/jobs/{group}/{name}/history
    // =========================================================
    @RequestMapping(value = "/jobs/{group}/{name}/history", method = RequestMethod.GET)
    @ResponseBody
    public List<Map<String, Object>> getJobHistory(
            @PathVariable String group, @PathVariable String name) {
        List<ExecutionRecord> records =
                JobExecutionHistoryListener.getInstance().getByJob(group, name);
        return toHistoryResponse(records);
    }

    // =========================================================
    // GET /api/history/recent
    // =========================================================
    @RequestMapping(value = "/history/recent", method = RequestMethod.GET)
    @ResponseBody
    public List<Map<String, Object>> getRecentHistory() {
        List<ExecutionRecord> records =
                JobExecutionHistoryListener.getInstance().getRecent(10);
        return toHistoryResponse(records);
    }

    // =========================================================
    // POST /api/jobs/{group}/{name}/trigger
    // =========================================================
    @RequestMapping(value = "/jobs/{group}/{name}/trigger", method = RequestMethod.POST)
    @ResponseBody
    public Map<String, Object> triggerJob(
            @PathVariable String group, @PathVariable String name) throws SchedulerException {
        scheduler.triggerJob(JobKey.jobKey(name, group));
        return Collections.singletonMap("message", "triggered");
    }

    // =========================================================
    // POST /api/jobs/{group}/{name}/pause
    // =========================================================
    @RequestMapping(value = "/jobs/{group}/{name}/pause", method = RequestMethod.POST)
    @ResponseBody
    public Map<String, Object> pauseJob(
            @PathVariable String group, @PathVariable String name) throws SchedulerException {
        scheduler.pauseJob(JobKey.jobKey(name, group));
        return Collections.singletonMap("message", "paused");
    }

    // =========================================================
    // POST /api/jobs/{group}/{name}/resume
    // =========================================================
    @RequestMapping(value = "/jobs/{group}/{name}/resume", method = RequestMethod.POST)
    @ResponseBody
    public Map<String, Object> resumeJob(
            @PathVariable String group, @PathVariable String name) throws SchedulerException {
        scheduler.resumeJob(JobKey.jobKey(name, group));
        return Collections.singletonMap("message", "resumed");
    }

    // =========================================================
    // 헬퍼 메서드
    // =========================================================
    private Map<String, Object> buildJobSummary(JobKey key) throws SchedulerException {
        JobDetail detail = scheduler.getJobDetail(key);
        List<? extends Trigger> triggers = scheduler.getTriggersOfJob(key);

        String status = "UNKNOWN";
        String nextFireTime = null;
        String previousFireTime = null;
        String cronExpression = null;

        for (Trigger trigger : triggers) {
            Trigger.TriggerState state = scheduler.getTriggerState(trigger.getKey());
            if (state == Trigger.TriggerState.BLOCKED) { status = "RUNNING"; break; }
            else if (state == Trigger.TriggerState.PAUSED) status = "PAUSED";
            else if (state == Trigger.TriggerState.ERROR) status = "ERROR";
            else if (state == Trigger.TriggerState.NORMAL) status = "WAITING";

            if (trigger.getNextFireTime() != null)
                nextFireTime = ISO_FORMAT.format(trigger.getNextFireTime());
            if (trigger.getPreviousFireTime() != null)
                previousFireTime = ISO_FORMAT.format(trigger.getPreviousFireTime());
            if (trigger instanceof CronTrigger)
                cronExpression = ((CronTrigger) trigger).getCronExpression();
        }

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("name", key.getName());
        map.put("group", key.getGroup());
        map.put("description", detail != null ? detail.getDescription() : null);
        map.put("jobClass", detail != null ? detail.getJobClass().getName() : null);
        map.put("status", status);
        map.put("nextFireTime", nextFireTime);
        map.put("previousFireTime", previousFireTime);
        map.put("cronExpression", cronExpression);
        return map;
    }

    private Map<String, Object> buildTriggerInfo(Trigger trigger) throws SchedulerException {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("name", trigger.getKey().getName());
        map.put("group", trigger.getKey().getGroup());
        map.put("cronExpression", trigger instanceof CronTrigger
                ? ((CronTrigger) trigger).getCronExpression() : null);
        map.put("nextFireTime", trigger.getNextFireTime() != null
                ? ISO_FORMAT.format(trigger.getNextFireTime()) : null);
        map.put("previousFireTime", trigger.getPreviousFireTime() != null
                ? ISO_FORMAT.format(trigger.getPreviousFireTime()) : null);
        map.put("state", scheduler.getTriggerState(trigger.getKey()).name());
        return map;
    }

    private List<Map<String, Object>> toHistoryResponse(List<ExecutionRecord> records) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (ExecutionRecord r : records) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", r.id);
            map.put("jobName", r.jobName);
            map.put("jobGroup", r.jobGroup);
            map.put("startTime", ISO_FORMAT.format(r.startTime));
            map.put("endTime", r.endTime != null ? ISO_FORMAT.format(r.endTime) : null);
            map.put("durationMs", r.durationMs);
            map.put("success", r.success);
            map.put("errorMessage", r.errorMessage);
            result.add(map);
        }
        return result;
    }
}
