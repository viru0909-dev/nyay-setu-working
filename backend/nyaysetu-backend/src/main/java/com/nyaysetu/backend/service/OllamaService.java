package com.nyaysetu.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nyaysetu.backend.dto.OllamaChatResponse;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class OllamaService {

    @Value("${ollama.base.url:http://localhost:11434}")
    private String ollamaBaseUrl;

    @Value("${ollama.model:gemma3:1b}")
    private String defaultModel;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OllamaService() {
        // Configure RestTemplate with timeout to prevent hanging
        this.restTemplate = new RestTemplate();
        this.restTemplate.setRequestFactory(new org.springframework.http.client.SimpleClientHttpRequestFactory() {{
            setConnectTimeout(5000);  // 5 seconds connection timeout
            setReadTimeout(30000);     // 30 seconds read timeout
        }});
    }

    /**
     * Chat with Ollama AI - Main method
     */
    public OllamaChatResponse chat(String message) {
        return chat(message, defaultModel);
    }

    /**
     * Chat with Ollama AI - Main method
     * Uses instant mock responses to prevent laptop hanging
     */
    public OllamaChatResponse chat(String message, String model) {
        // FAST MODE: Use instant mock responses instead of slow Ollama
        return getMockResponse(message);
    }
    
    /**
     * Get instant mock response for common legal questions
     */
    private OllamaChatResponse getMockResponse(String message) {
        String response;
        String lowerMessage = message.toLowerCase();
        
        // Constitution Articles
        if (lowerMessage.contains("article 21") || lowerMessage.contains("right to life")) {
            response = "Article 21 of the Indian Constitution guarantees the Right to Life and Personal Liberty. It states: 'No person shall be deprived of his life or personal liberty except according to procedure established by law.' This is a fundamental right that protects citizens' basic freedoms and has been interpreted broadly by the Supreme Court to include dignity, privacy, and quality of life.";
        } else if (lowerMessage.contains("article 14") || lowerMessage.contains("equality")) {
            response = "Article 14 ensures Equality Before Law. The State shall not deny equality before the law or equal protection of laws to any person within India. This prevents discrimination and ensures fair treatment for all citizens.";
        } else if (lowerMessage.contains("article 19") || lowerMessage.contains("freedom of speech")) {
            response = "Article 19 guarantees six fundamental freedoms to citizens: freedom of speech and expression, freedom to assemble peacefully, freedom to form associations, freedom to move freely throughout India, freedom to reside and settle anywhere in India, and freedom to practice any profession or occupation.";
        } else if (lowerMessage.contains("article 32") || lowerMessage.contains("constitutional remedy")) {
            response = "Article 32 provides the Right to Constitutional Remedies. It empowers citizens to move directly to the Supreme Court for enforcement of Fundamental Rights through writs like Habeas Corpus, Mandamus, Prohibition, Quo Warranto, and Certiorari. Dr. Ambedkar called it the 'heart and soul' of the Constitution.";
        } else if (lowerMessage.contains("fundamental right")) {
            response = "India's Constitution provides six Fundamental Rights: Right to Equality (Articles 14-18), Right to Freedom (Articles 19-22), Right against Exploitation (Articles 23-24), Right to Freedom of Religion (Articles 25-28), Cultural and Educational Rights (Articles 29-30), and Right to Constitutional Remedies (Article 32).";
        }
        
        // Filing Cases & Legal Procedures
        else if (lowerMessage.contains("file") || lowerMessage.contains("case") || lowerMessage.contains("fir")) {
            response = "To file a case or FIR in India: 1) Visit the nearest police station for criminal matters, 2) For civil matters, approach the appropriate court, 3) You can also file online through your state's police website or eCourts portal, 4) Keep all evidence and documentation ready. Legal aid is available for those who cannot afford lawyers through NALSA (National Legal Services Authority).";
        } else if (lowerMessage.contains("court") || lowerMessage.contains("hearing")) {
            response = "In India, you can track your case status online through the eCourts portal (https://ecourts.gov.in). You'll need your Case Number or Party Name. Virtual hearings are also available through video conference for many courts. You can check hearing dates, orders, and judgments online.";
        } else if (lowerMessage.contains("bail")) {
            response = "Bail is the temporary release of an accused person pending trial, on the condition that they will appear in court when required. There are three types: Regular Bail (applied after arrest), Anticipatory Bail (pre-arrest protection), and Interim Bail (temporary relief). Factors considered include severity of the crime, flight risk, and criminal history.";
        }
        
        // Lawyers & Legal Aid
        else if (lowerMessage.contains("lawyer") || lowerMessage.contains("advocate")) {
            response = "To find a lawyer: 1) Use the Bar Council website to search for registered advocates, 2) Contact your nearest District Legal Services Authority for free legal aid if eligible, 3) Use online platforms like the eCourts Services, 4) Ask for recommendations from local bar associations. Free legal aid is available to women, children, SC/ST members, and those with income below ₹9,000/month.";
        } else if (lowerMessage.contains("legal aid") || lowerMessage.contains("free legal")) {
            response = "Free legal aid is provided under Legal Services Authorities Act, 1987. Eligible persons include: women, children, SC/ST members, persons with disabilities, victims of trafficking or natural disasters, industrial workers, and those with annual income below ₹9,000. Contact your nearest Legal Services Authority or call NALSA toll-free: 15100.";
        }
        
        // Marriage & Family Law
        else if (lowerMessage.contains("divorce") || lowerMessage.contains("marriage")) {
            response = "Divorce in India can be obtained through: 1) Mutual Consent (simplest, both parties agree), or 2) Contested Divorce (on specific grounds like cruelty, adultery, desertion). The process involves filing a petition, serving notice, evidence presentation, and a court decree. Maintenance rights exist for women and children. Consult a family law expert for your specific case.";
        } else if (lowerMessage.contains("domestic violence") || lowerMessage.contains("498a")) {
            response = "The Protection of Women from Domestic Violence Act, 2005 protects women from abuse in domestic relationships. Remedies include: protection orders, residence orders, monetary relief, custody orders, and compensation. Emergency help: Women Helpline 181 or 1091. You can file complaints at police stations or apply to Magistrate Court.";
        }
        
        // Property & Land
        else if (lowerMessage.contains("property") || lowerMessage.contains("land")) {
            response = "Property law in India covers ownership, transfer, and disputes. Key points: 1) Always verify land titles through official records, 2) Registration is mandatory for property transactions, 3) Inheritance follows personal laws (Hindu, Muslim, Christian), 4) Property disputes are resolved through civil courts. The Transfer of Property Act, 1882 and Registration Act, 1908 govern most property matters.";
        }
        
        // Consumer Rights
        else if (lowerMessage.contains("consumer") || lowerMessage.contains("refund")) {
            response = "The Consumer Protection Act, 2019 protects consumer rights. You can file complaints for: defective products, deficient services, unfair trade practices, or misleading advertisements. File at District, State, or National Consumer Commissions based on claim value. No court fees for claims up to ₹5 lakhs. Consumer Helpline: 1800-11-4000.";
        }
        
        // Police & Criminal Law
        else if (lowerMessage.contains("police") || lowerMessage.contains("arrest")) {
            response = "Your rights during arrest: 1) Police must inform you of grounds for arrest, 2) You have right to consult a lawyer, 3) Police must produce you before a magistrate within 24 hours, 4) You can't be detained beyond 24 hours without judicial permission, 5) You have right against self-incrimination. If police refuse to register FIR, approach the Superintendent of Police or Judicial Magistrate.";
        } else if (lowerMessage.contains("cybercrime") || lowerMessage.contains("online fraud")) {
            response = "For cybercrime: 1) File complaint at National Cyber Crime Reporting Portal (cybercrime.gov.in), 2) Report to local Cyber Crime Cell, 3) Block lost/stolen cards immediately, 4) Keep all evidence (screenshots, emails, transaction details). Cybercrime Helpline: 1930. Don't delay - many cybercrimes are time-sensitive.";
        }
        
        // Labor & Employment
        else if (lowerMessage.contains("labor") || lowerMessage.contains("employee") || lowerMessage.contains("salary")) {
            response = "Employee rights in India include: minimum wages, payment on time, 8-hour workday, weekly offs, leave entitlements, safe working conditions, and protection against unfair dismissal. File complaints with Labor Commissioner for wage disputes. The Payment of Wages Act, Minimum Wages Act, and Industrial Disputes Act protect workers.";
        }
        
        // RTI & Government
        else if (lowerMessage.contains("rti") || lowerMessage.contains("right to information")) {
            response = "The Right to Information Act, 2005 allows citizens to request information from public authorities. File RTI: 1) Identify the relevant department, 2) Pay ₹10 application fee, 3) Submit application to Public Information Officer, 4) Response within 30 days (48 hours for life/liberty matters). RTI can't be denied except under specific exemptions. Appeals available to higher authorities.";
        }
        
        // Default Response
        else {
            response = "I can help you with Indian legal matters including:\n\n" +
                    "📜 Constitution articles and fundamental rights\n" +
                    "⚖️ Filing cases, FIRs, and court procedures\n" +
                    "👨‍⚖️ Finding lawyers and legal aid\n" +
                    "👪 Family law (divorce, domestic violence)\n" +
                    "🏠 Property and land disputes\n" +
                    "🛡️ Consumer rights and complaints\n" +
                    "👮 Police procedures and arrests\n" +
                    "📱 Cybercrime and online fraud\n" +
                    "💼 Labor and employment rights\n" +
                    "📋 RTI and government services\n\n" +
                    "Please ask me specific questions about these topics, and I'll provide detailed information. For personalized legal advice, please consult a qualified lawyer.";
        }
        
        return OllamaChatResponse.builder()
                .response(response)
                .model("mock-instant")
                .status("online")
                .fromOllama(false)
                .totalDuration(100L)
                .build();
    }
    
    /**
     * Original Ollama chat method (currently disabled to prevent hanging)
     */
    @SuppressWarnings("unused")
    private OllamaChatResponse chatWithOllama(String message, String model) {
        try {
            // Use default model if not specified
            if (model == null || model.trim().isEmpty()) {
                model = defaultModel;
            }
            
            log.info("Sending request to Ollama - Model: {}, Message length: {}", model, message.length());
            
            String url = ollamaBaseUrl + "/api/generate";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Build Ollama request
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", model);
            requestBody.put("prompt", buildLegalPrompt(message));
            requestBody.put("stream", false); // Non-streaming for simplicity
            
            // Optimized options for faster responses
            ObjectNode options = requestBody.putObject("options");
            options.put("temperature", 0.7);
            options.put("num_predict", 150);  // Limit response length
            options.put("top_k", 20);         // Reduced for speed
            options.put("top_p", 0.8);

            HttpEntity<String> request = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode jsonResponse = objectMapper.readTree(response.getBody());
                String aiResponse = jsonResponse.path("response").asText();
                
                log.info("Ollama response received successfully - Length: {}", aiResponse.length());
                return OllamaChatResponse.builder()
                        .response(aiResponse)
                        .model(model)
                        .status("online")
                        .fromOllama(true)
                        .totalDuration(jsonResponse.path("total_duration").asLong(0))
                        .build();
            }
            
            log.warn("Ollama returned non-OK status: {}", response.getStatusCode());
            return getFallbackResponse(message);
            
        } catch (Exception e) {
            log.error("Ollama API error: {}", e.getMessage(), e);
            return getFallbackResponse(message);
        }
    }

    /**
     * Constitution-specific Q&A
     */
    public OllamaChatResponse constitutionQA(String question, String articleText) {
        String prompt = String.format(
            "You are a legal expert on the Indian Constitution. " +
            "Answer this question based on the given article text.\\n\\n" +
            "Question: %s\\n\\n" +
            "Article Text: %s\\n\\n" +
            "Provide a clear, accurate answer in simple language. " +
            "Cite specific clauses or sections when relevant.",
            question, articleText
        );
        
        return chat(prompt);
    }

    /**
     * Build legal-domain optimized prompt
     */
    private String buildLegalPrompt(String userMessage) {
        return "You are an AI legal assistant for NyaySetu, India's virtual judiciary platform. " +
               "Your role is to provide accurate, helpful information about Indian law, the Constitution, " +
               "legal procedures, and citizens' rights.\\n\\n" +
               "Guidelines:\\n" +
               "- Keep responses clear, concise, and under 200 words\\n" +
               "- Use simple language accessible to common citizens\\n" +
               "- Cite relevant articles, sections, or laws when discussing legal matters\\n" +
               "- For complex legal advice, remind users to consult a qualified lawyer\\n" +
               "- Support both English and Hindi terminology\\n" +
               "- Be respectful and professional\\n\\n" +
               "User Question: " + userMessage;
    }

    /**
     * Check if Ollama is running and accessible
     */
    public boolean isOllamaAvailable() {
        try {
            String url = ollamaBaseUrl + "/api/tags";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            log.warn("Ollama not available: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get list of available models
     */
    public String[] getAvailableModels() {
        try {
            String url = ollamaBaseUrl + "/api/tags";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode jsonResponse = objectMapper.readTree(response.getBody());
                JsonNode models = jsonResponse.path("models");
                
                String[] modelNames = new String[models.size()];
                for (int i = 0; i < models.size(); i++) {
                    modelNames[i] = models.get(i).path("name").asText();
                }
                return modelNames;
            }
        } catch (Exception e) {
            log.error("Error fetching Ollama models: {}", e.getMessage());
        }
        return new String[]{};
    }

    /**
     * Fallback responses when Ollama is unavailable
     */
    private OllamaChatResponse getFallbackResponse(String message) {
        String lowerMessage = message.toLowerCase();
        String response;
        
        if (lowerMessage.contains("constitution") || lowerMessage.contains("संविधान")) {
            response = "The Indian Constitution is the supreme law of India, adopted on 26th November 1949. " +
                   "It contains 470 articles in 25 parts. You can browse the Constitution using our Constitution Reader. " +
                   "(Note: AI service is currently unavailable - using fallback responses)";
        } else if (lowerMessage.contains("rights") || lowerMessage.contains("अधिकार")) {
            response = "Fundamental Rights (Part III): Right to Equality, Freedom, Against Exploitation, " +
                   "Freedom of Religion, Cultural & Educational Rights, and Constitutional Remedies. " +
                   "(Note: AI service is currently unavailable - using fallback responses)";
        } else if (lowerMessage.contains("file") || lowerMessage.contains("केस")) {
            response = "To file a case: Login → File Case → Fill Details → Upload Documents → Submit. " +
                   "(Note: AI service is currently unavailable - using fallback responses)";
        } else {
            response = "I can help with: Constitution, Legal Rights, Filing Cases, Finding Lawyers, and Virtual Hearings. " +
                   "(Note: AI service is currently unavailable - using fallback responses)";
        }
        
        return OllamaChatResponse.builder()
                .response(response)
                .model("fallback")
                .status("offline")
                .fromOllama(false)
                .totalDuration(0L)
                .build();
    }
}
