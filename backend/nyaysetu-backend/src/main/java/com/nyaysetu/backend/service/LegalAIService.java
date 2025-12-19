package com.nyaysetu.backend.service;

import com.azure.ai.openai.OpenAIClient;
import com.azure.ai.openai.OpenAIClientBuilder;
import com.azure.ai.openai.models.*;
import com.azure.core.credential.AzureKeyCredential;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;

/**
 * Azure OpenAI Service for Vakil-Friend Chat Assistant
 * Uses GPT-4o-mini to guide users through case filing
 */
@Service
@Slf4j
public class LegalAIService {

    @Value("${azure.openai.api.key}")
    private String azureOpenAIKey;

    @Value("${azure.openai.endpoint}")
    private String azureOpenAIEndpoint;

    @Value("${azure.openai.deployment.name:gpt-4o-mini}")
    private String deploymentName;

    private OpenAIClient openAIClient;

    @PostConstruct
    public void initializeClient() {
        log.info("Initializing Azure OpenAI Client...");
        
        // Check if Azure OpenAI is configured
        if (azureOpenAIKey == null || azureOpenAIKey.isEmpty() || azureOpenAIKey.equals("${AZURE_OPENAI_API_KEY:}")) {
            log.warn("⚠️ Azure OpenAI API key not configured. Service will use fallback responses.");
            log.info("💡 Set AZURE_OPENAI_API_KEY environment variable to enable Azure OpenAI.");
            this.openAIClient = null;
            return;
        }
        
        try {
            this.openAIClient = new OpenAIClientBuilder()
                .endpoint(azureOpenAIEndpoint)
                .credential(new AzureKeyCredential(azureOpenAIKey))
                .buildClient();
            log.info("✅ Azure OpenAI Client initialized successfully");
        } catch (Exception e) {
            log.error("❌ Failed to initialize Azure OpenAI Client: {}", e.getMessage());
            log.warn("⚠️ Service will use fallback responses instead.");
            this.openAIClient = null;
        }
    }

    /**
     * Chat with Vakil-Friend AI Assistant
     * @param userMessage User's message
     * @param conversationHistory Previous messages in the conversation
     * @return AI response
     */
    public String chat(String userMessage, List<ChatRequestMessage> conversationHistory) {
        log.info("Processing chat message: {}", userMessage.substring(0, Math.min(50, userMessage.length())));
        
        // Return fallback if Azure OpenAI is not configured
        if (openAIClient == null) {
            log.warn("Azure OpenAI not configured, using fallback response");
            return getFallbackResponse(userMessage);
        }

        try {
            // Build conversation with system prompt
            List<ChatRequestMessage> messages = new ArrayList<>();
            
            // System prompt for Vakil-Friend
            messages.add(new ChatRequestSystemMessage(getVakilFriendSystemPrompt()));
            
            // Add conversation history
            if (conversationHistory != null && !conversationHistory.isEmpty()) {
                messages.addAll(conversationHistory);
            }
            
            // Add user's current message
            messages.add(new ChatRequestUserMessage(userMessage));

            // Create chat completion request
            ChatCompletionsOptions options = new ChatCompletionsOptions(messages)
                .setMaxTokens(800)
                .setTemperature(0.7)
                .setTopP(0.95)
                .setFrequencyPenalty(0.0)
                .setPresencePenalty(0.0);

            // Call Azure OpenAI
            ChatCompletions chatCompletions = openAIClient.getChatCompletions(
                deploymentName, 
                options
            );

            // Extract response
            String aiResponse = chatCompletions.getChoices().get(0)
                .getMessage()
                .getContent();

            log.info("✅ AI response generated successfully");
            return aiResponse;

        } catch (Exception e) {
            log.error("❌ Azure OpenAI API call failed", e);
            return getFallbackResponse(userMessage);
        }
    }

    /**
     * Generate judge summary from completed conversation
     * @param caseDetails Structured case data
     * @return JSON summary for judge
     */
    public String generateJudgeSummary(String caseDetails) {
        log.info("Generating judge summary...");

        try {
            List<ChatRequestMessage> messages = new ArrayList<>();
            
            messages.add(new ChatRequestSystemMessage(
                "You are an AI legal assistant that creates concise case summaries for judges. " +
                "Generate a JSON summary with: caseType, parties, facts, legalIssues, evidence, urgency, recommendation."
            ));
            
            messages.add(new ChatRequestUserMessage(
                "Create a judge summary for this case:\n" + caseDetails
            ));

            ChatCompletionsOptions options = new ChatCompletionsOptions(messages)
                .setMaxTokens(1000)
                .setTemperature(0.3) // Lower temperature for structured output
                .setResponseFormat(new ChatCompletionsJsonResponseFormat());

            ChatCompletions chatCompletions = openAIClient.getChatCompletions(
                deploymentName, 
                options
            );

            return chatCompletions.getChoices().get(0)
                .getMessage()
                .getContent();

        } catch (Exception e) {
            log.error("❌ Failed to generate judge summary", e);
            throw new RuntimeException("Judge summary generation failed", e);
        }
    }

    /**
     * System prompt for Vakil-Friend AI
     */
    private String getVakilFriendSystemPrompt() {
        return """
            You are Vakil-Friend, an AI legal assistant for Nyay-Setu, India's digital judiciary platform.
            
            Your role is to help citizens file legal cases by:
            1. Understanding their legal issue in simple language (English/Hindi)
            2. Asking clarifying questions about parties involved, dates, evidence
            3. Explaining legal procedures in citizen-friendly language
            4. Guiding them to provide necessary details
            5. Ensuring all required information is collected
            
            Guidelines:
            - Be empathetic and patient
            - Use simple language, avoid complex legal jargon
            - Ask ONE question at a time
            - Validate information before proceeding
            - Remind users about evidence requirements
            - Explain next steps clearly
            
            Case Types: CIVIL, CRIMINAL, FAMILY, PROPERTY, COMMERCIAL
            Required Info: Case type, parties (petitioner/respondent), description, evidence, urgency
            
            Always maintain a helpful, professional, and respectful tone.
            """;
    }

    /**
     * Fallback response when Azure API fails
     */
    private String getFallbackResponse(String userMessage) {
        return "I apologize, but I'm experiencing technical difficulties. " +
               "Please try again in a moment, or use the traditional case filing form. " +
               "For urgent matters, please contact the court directly.";
    }

    /**
     * Extract structured case data from conversation
     * @param conversationHistory Full chat history
     * @return Structured case data as JSON
     */
    public String extractCaseData(List<ChatRequestMessage> conversationHistory) {
        log.info("Extracting structured case data from conversation...");

        try {
            List<ChatRequestMessage> messages = new ArrayList<>();
            
            messages.add(new ChatRequestSystemMessage(
                "Extract case filing information from the conversation. Return JSON with: " +
                "caseType, title, description, petitioner, respondent, urgency, evidenceList."
            ));
            
            // Combine conversation into context  
            StringBuilder context = new StringBuilder("Conversation:\n");
            for (ChatRequestMessage msg : conversationHistory) {
                // ChatRequestMessage is abstract, instances will be UserMessage or AssistantMessage
                if (msg instanceof ChatRequestUserMessage) {
                    context.append("User: ").append(((ChatRequestUserMessage) msg).getContent()).append("\n");
                } else if (msg instanceof ChatRequestAssistantMessage) {
                    context.append("Assistant: ").append(((ChatRequestAssistantMessage) msg).getContent()).append("\n");
                }
            }
            
            messages.add(new ChatRequestUserMessage(context.toString()));

            ChatCompletionsOptions options = new ChatCompletionsOptions(messages)
                .setMaxTokens(800)
                .setTemperature(0.1)
                .setResponseFormat(new ChatCompletionsJsonResponseFormat());

            ChatCompletions chatCompletions = openAIClient.getChatCompletions(
                deploymentName, 
                options
            );

            return chatCompletions.getChoices().get(0)
                .getMessage()
                .getContent();

        } catch (Exception e) {
            log.error("❌ Failed to extract case data", e);
            throw new RuntimeException("Case data extraction failed", e);
        }
    }
}
