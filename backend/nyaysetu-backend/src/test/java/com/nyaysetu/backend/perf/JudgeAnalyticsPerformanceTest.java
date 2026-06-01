package com.nyaysetu.backend.perf;

import com.nyaysetu.backend.entity.CaseEntity;
import com.nyaysetu.backend.entity.CaseStatus;
import com.nyaysetu.backend.repository.CaseRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@SpringBootTest
public class JudgeAnalyticsPerformanceTest {

    @Autowired
    private CaseRepository caseRepository;

    // Heavy performance test that seeds 100k rows. Run locally when needed.
    @Test
    public void seed100kCasesAndMeasureAggregates() {
        final int TOTAL = 100_000;
        final int BATCH = 5_000;
        final String JUDGE_NAME = "Judge Performance";

        Random rnd = new Random(12345);
        List<CaseEntity> batch = new ArrayList<>(BATCH);

        long startSeed = System.nanoTime();
        for (int i = 0; i < TOTAL; i++) {
            CaseEntity c = CaseEntity.builder()
                    .title("Perf Case " + i)
                    .description("Auto-generated performance test case")
                    .caseType((i % 4 == 0) ? "CIVIL" : (i % 4 == 1) ? "CRIMINAL" : (i % 4 == 2) ? "FAMILY" : "PROPERTY")
                    .status((i % 10 == 0) ? CaseStatus.CLOSED : CaseStatus.IN_PROGRESS)
                    .assignedJudge((i % 2 == 0) ? JUDGE_NAME : null) // half assigned, half unassigned
                    .filedDate(LocalDateTime.now().minusDays(rnd.nextInt(365)))
                    .build();

            batch.add(c);

            if (batch.size() >= BATCH) {
                caseRepository.saveAll(batch);
                caseRepository.flush();
                batch.clear();
            }
        }

        if (!batch.isEmpty()) {
            caseRepository.saveAll(batch);
            caseRepository.flush();
            batch.clear();
        }
        long endSeed = System.nanoTime();

        System.out.printf("Seeded %,d cases in %.2f seconds%n", TOTAL, (endSeed - startSeed) / 1e9);

        // Measure findByAssignedJudge
        long t1 = System.nanoTime();
        List<CaseEntity> assigned = caseRepository.findByAssignedJudge(JUDGE_NAME);
        long t2 = System.nanoTime();
        System.out.printf("findByAssignedJudge returned %,d rows in %.3f ms%n", assigned.size(), (t2 - t1) / 1e6);

        // Simulate controller-side aggregation (grouping by status and type)
        long t3 = System.nanoTime();
        long pending = assigned.stream().filter(c -> c.getStatus() == CaseStatus.PENDING).count();
        long inprogress = assigned.stream().filter(c -> c.getStatus() == CaseStatus.IN_PROGRESS).count();
        long closed = assigned.stream().filter(c -> c.getStatus() == CaseStatus.CLOSED).count();
        long t4 = System.nanoTime();
        System.out.printf("In-memory grouping on %,d rows took %.3f ms (pending=%d,inprogress=%d,closed=%d)%n",
                assigned.size(), (t4 - t3) / 1e6, pending, inprogress, closed);

        // Measure unassigned query
        long t5 = System.nanoTime();
        List<CaseEntity> unassigned = caseRepository.findUnassignedCases();
        long t6 = System.nanoTime();
        System.out.printf("findUnassignedCases returned %,d rows in %.3f ms%n", unassigned.size(), (t6 - t5) / 1e6);
    }
}
