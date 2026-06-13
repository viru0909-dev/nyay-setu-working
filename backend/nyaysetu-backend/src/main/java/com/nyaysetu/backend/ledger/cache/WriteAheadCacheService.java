package com.nyaysetu.backend.ledger.cache;

import com.nyaysetu.backend.ledger.gateway.FabricGatewayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Write-Ahead Cache (WAL) service that buffers ledger write operations
 * before committing them to the Fabric chaincode world state.
 * <p>
 * This prevents interface choking during latency spikes by:
 * <ol>
 *   <li>Accepting writes into a thread-safe {@link LinkedBlockingQueue}</li>
 *   <li>Periodically flushing the queue to the chaincode via a
 *       {@code @Scheduled} background task</li>
 *   <li>Providing read-through access for recently cached entries via a
 *       {@link ConcurrentHashMap}</li>
 * </ol>
 * <p>
 * This serves as a Redis-mock fallback: in production deployments, this
 * can be swapped for an actual Redis-backed cache with minimal refactoring.
 */
@Service
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class WriteAheadCacheService {

    private final FabricGatewayService fabricGatewayService;

    @Value("${ledger.cache.max-pending-writes:1000}")
    private int maxPendingWrites;

    /** Write-ahead log queue — thread-safe bounded queue */
    private final LinkedBlockingQueue<CacheEntry> walQueue = new LinkedBlockingQueue<>(2000);

    /** Read-through cache — recent writes accessible before flush */
    private final ConcurrentHashMap<String, Map<String, String>> readCache = new ConcurrentHashMap<>();

    /** Statistics counters */
    private final AtomicLong totalBuffered = new AtomicLong(0);
    private final AtomicLong totalFlushed = new AtomicLong(0);
    private final AtomicLong totalDropped = new AtomicLong(0);

    // ── Buffer Write ────────────────────────────────────────────────────────

    /**
     * Buffer a ledger write operation into the WAL queue.
     * <p>
     * If the queue is full, the entry is dropped with a warning log.
     * The entry is also placed in the read-through cache for immediate
     * availability before the flush cycle runs.
     *
     * @param functionName the chaincode function to invoke
     * @param args         the transaction arguments
     */
    public void bufferWrite(String functionName, Map<String, String> args) {
        CacheEntry entry = new CacheEntry(
                UUID.randomUUID().toString(),
                functionName,
                new LinkedHashMap<>(args),
                LocalDateTime.now()
        );

        boolean offered = walQueue.offer(entry);
        if (offered) {
            totalBuffered.incrementAndGet();
            // Also populate read-through cache
            String cacheKey = functionName + ":" + args.getOrDefault("evidenceId", entry.entryId);
            readCache.put(cacheKey, args);
            log.debug("[WAL] Buffered write: {} (queue size: {})", functionName, walQueue.size());
        } else {
            totalDropped.incrementAndGet();
            log.warn("[WAL] Queue full — dropped write for {}: {}", functionName,
                    args.getOrDefault("evidenceId", "unknown"));
        }
    }

    // ── Read-Through Cache ──────────────────────────────────────────────────

    /**
     * Get a cached entry from the read-through cache.
     *
     * @param cacheKey the cache key (functionName:evidenceId)
     * @return the cached args, or null if not found
     */
    public Map<String, String> getCachedEntry(String cacheKey) {
        return readCache.get(cacheKey);
    }

    /**
     * Get the number of pending writes in the WAL queue.
     */
    public int getPendingWriteCount() {
        return walQueue.size();
    }

    /**
     * Get all pending writes as a snapshot (for monitoring/diagnostics).
     */
    public List<Map<String, Object>> getPendingWrites() {
        List<Map<String, Object>> pending = new ArrayList<>();
        for (CacheEntry entry : walQueue) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("entryId", entry.entryId);
            item.put("function", entry.functionName);
            item.put("args", entry.args);
            item.put("bufferedAt", entry.bufferedAt.toString());
            pending.add(item);
        }
        return pending;
    }

    // ── Scheduled Flush ─────────────────────────────────────────────────────

    /**
     * Background task that drains the WAL queue and commits entries to the
     * Fabric chaincode world state.
     * <p>
     * Runs at a fixed interval configured by {@code ledger.cache.flush-interval-ms}
     * (default: 5000ms).
     */
    @Scheduled(fixedDelayString = "${ledger.cache.flush-interval-ms:5000}")
    public void flushPendingWrites() {
        if (walQueue.isEmpty()) {
            return;
        }

        int batchSize = Math.min(walQueue.size(), 50); // Process up to 50 per cycle
        List<CacheEntry> batch = new ArrayList<>(batchSize);
        walQueue.drainTo(batch, batchSize);

        if (batch.isEmpty()) {
            return;
        }

        log.info("[WAL] Flushing {} pending writes to chaincode...", batch.size());

        int successCount = 0;
        for (CacheEntry entry : batch) {
            try {
                fabricGatewayService.submitTransaction(entry.functionName, entry.args);
                successCount++;
                totalFlushed.incrementAndGet();

                // Remove from read cache after successful flush
                String cacheKey = entry.functionName + ":" +
                        entry.args.getOrDefault("evidenceId", entry.entryId);
                readCache.remove(cacheKey);
            } catch (Exception e) {
                log.error("[WAL] Failed to flush entry {} ({}): {}",
                        entry.entryId, entry.functionName, e.getMessage());
                // Re-queue failed entries (if queue has space)
                walQueue.offer(entry);
            }
        }

        log.info("[WAL] Flush complete: {}/{} succeeded, queue remaining: {}",
                successCount, batch.size(), walQueue.size());
    }

    // ── Statistics ──────────────────────────────────────────────────────────

    /**
     * Get WAL cache statistics for monitoring.
     */
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("pendingWrites", walQueue.size());
        stats.put("readCacheSize", readCache.size());
        stats.put("totalBuffered", totalBuffered.get());
        stats.put("totalFlushed", totalFlushed.get());
        stats.put("totalDropped", totalDropped.get());
        stats.put("timestamp", LocalDateTime.now().toString());
        return stats;
    }

    // ── Internal ────────────────────────────────────────────────────────────

    /**
     * Represents a single buffered write operation.
     */
    private record CacheEntry(
            String entryId,
            String functionName,
            Map<String, String> args,
            LocalDateTime bufferedAt
    ) {}
}
