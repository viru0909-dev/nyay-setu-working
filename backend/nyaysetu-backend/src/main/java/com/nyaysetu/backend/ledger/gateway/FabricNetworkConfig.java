package com.nyaysetu.backend.ledger.gateway;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.util.*;

/**
 * Spring configuration bean that loads the Hyperledger Fabric network profile
 * and provides network metadata to the gateway service.
 * <p>
 * Reads the connection profile path, channel name, chaincode name, and
 * wallet path from {@code application.properties}.
 */
@Configuration
@Getter
@Slf4j
public class FabricNetworkConfig {

    @Value("${fabric.network.profile:classpath:hyperledger/connection-profile.yaml}")
    private String networkProfilePath;

    @Value("${fabric.channel.name:evidence-channel}")
    private String channelName;

    @Value("${fabric.chaincode.name:evidence-ledger}")
    private String chaincodeName;

    @Value("${fabric.wallet.path:./fabric-wallet}")
    private String walletPath;

    /** Organization definitions loaded at startup */
    private final Map<String, OrgConfig> organizations = new LinkedHashMap<>();

    /** Mapping from application Role names to Fabric MSPID */
    private final Map<String, String> roleToMspId = new LinkedHashMap<>();

    @PostConstruct
    public void initialize() {
        log.info("Initializing Fabric Network Configuration...");
        log.info("  Network Profile : {}", networkProfilePath);
        log.info("  Channel         : {}", channelName);
        log.info("  Chaincode       : {}", chaincodeName);
        log.info("  Wallet Path     : {}", walletPath);

        // Register organizations
        organizations.put("PoliceOrg", new OrgConfig(
                "PoliceOrgMSP",
                "peer0.police.nyaysetu.gov.in",
                "grpcs://peer0.police.nyaysetu.gov.in:7051",
                "ca.police.nyaysetu.gov.in"
        ));
        organizations.put("JudiciaryOrg", new OrgConfig(
                "JudiciaryOrgMSP",
                "peer0.judiciary.nyaysetu.gov.in",
                "grpcs://peer0.judiciary.nyaysetu.gov.in:8051",
                "ca.judiciary.nyaysetu.gov.in"
        ));
        organizations.put("ForensicOrg", new OrgConfig(
                "ForensicOrgMSP",
                "peer0.forensic.nyaysetu.gov.in",
                "grpcs://peer0.forensic.nyaysetu.gov.in:9051",
                "ca.forensic.nyaysetu.gov.in"
        ));

        // Map application roles to Fabric MSP IDs
        roleToMspId.put("POLICE", "PoliceOrgMSP");
        roleToMspId.put("JUDGE", "JudiciaryOrgMSP");
        roleToMspId.put("SUPER_JUDGE", "JudiciaryOrgMSP");
        roleToMspId.put("ADMIN", "ForensicOrgMSP");
        roleToMspId.put("TECH_ADMIN", "ForensicOrgMSP");
        roleToMspId.put("TECHNICAL_TEAM", "ForensicOrgMSP");
        roleToMspId.put("LAWYER", "JudiciaryOrgMSP");
        roleToMspId.put("LITIGANT", "PoliceOrgMSP");

        log.info("Fabric network configuration loaded — {} organizations, {} role mappings",
                organizations.size(), roleToMspId.size());
    }

    /**
     * Resolve the Fabric MSP ID for a given application role.
     *
     * @param role the application role (e.g., JUDGE, POLICE)
     * @return the corresponding MSP ID (e.g., JudiciaryOrgMSP)
     */
    public String resolveMspId(String role) {
        return roleToMspId.getOrDefault(role, "JudiciaryOrgMSP");
    }

    /**
     * Get the organization name for a given MSP ID.
     */
    public String getOrgNameForMsp(String mspId) {
        return organizations.entrySet().stream()
                .filter(e -> e.getValue().mspId().equals(mspId))
                .map(Map.Entry::getKey)
                .findFirst()
                .orElse("UnknownOrg");
    }

    /**
     * Immutable record holding organization configuration.
     */
    public record OrgConfig(String mspId, String peerHost, String peerUrl, String caHost) {}
}
