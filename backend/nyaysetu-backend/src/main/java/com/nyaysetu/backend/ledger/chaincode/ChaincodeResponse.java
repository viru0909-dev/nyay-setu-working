package com.nyaysetu.backend.ledger.chaincode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO representing the response from a Hyperledger Fabric chaincode invocation.
 * <p>
 * Maps to the standard Fabric transaction response structure including
 * transaction ID, block height, endorsement status, and committed payload.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChaincodeResponse {

    /** Unique transaction identifier (simulated Fabric txId) */
    private String transactionId;

    /** Block number in which this transaction was committed */
    private long blockHeight;

    /** Transaction status: SUCCESS, FAILED, PENDING */
    private String status;

    /** ISO timestamp of transaction commitment */
    private LocalDateTime timestamp;

    /** The chaincode function that was invoked */
    private String function;

    /** SHA-256 hash of the committed payload */
    private String payloadHash;

    /** Arbitrary key-value payload returned by the chaincode */
    private Map<String, Object> payload;

    /** The MSP ID of the endorsing organization */
    private String endorserMspId;

    /** The channel on which the transaction was submitted */
    private String channelId;
}
