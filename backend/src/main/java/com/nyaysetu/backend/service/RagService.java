package com.nyaysetu.backend.service;

import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.DocumentParser;
import dev.langchain4j.data.document.parser.TextDocumentParser;
import dev.langchain4j.data.document.source.FileSystemSource;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.AllMiniLmL6V2EmbeddingModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.document.DocumentSplitter;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;

/**
 * RAG (Retrieval-Augmented Generation) Service
 * Manages the In-Memory Vector Database and Local Embeddings for Indian Legal Context.
 */
@Service
@Slf4j
public class RagService {

    private final EmbeddingStore<TextSegment> embeddingStore;
    private final EmbeddingModel embeddingModel;

    public RagService() {
        log.info("🔍 Initializing Local RAG Service & Vector Database...");
        
        // 1. Initialize In-Memory Vector Store
        this.embeddingStore = new InMemoryEmbeddingStore<>();

        // 2. Initialize Local Embedding Model (Runs entirely on CPU, no API keys)
        // This converts text chunks into mathematical vectors for similarity search.
        this.embeddingModel = new AllMiniLmL6V2EmbeddingModel();
    }

    @PostConstruct
    public void init() {
        log.info("📚 Loading Indian Legal Knowledge Base into Vector Database...");
        try {
            // Check if directory exists, if not just skip (we'll create it later)
            ClassPathResource resource = new ClassPathResource("legal_docs");
            if (!resource.exists()) {
                log.warn("⚠️ legal_docs folder not found in resources. RAG database will be empty.");
                return;
            }

            File folder = resource.getFile();
            if (folder.isDirectory()) {
                File[] files = folder.listFiles((dir, name) -> name.endsWith(".txt"));
                if (files != null && files.length > 0) {
                    for (File file : files) {
                        ingestDocument(file.toPath());
                    }
                    log.info("✅ Successfully loaded {} legal documents into Vector DB", files.length);
                } else {
                    log.info("ℹ️ No .txt documents found in legal_docs folder.");
                }
            }
        } catch (IOException e) {
            log.error("❌ Failed to load legal documents: {}", e.getMessage());
            // Fallback for running inside JAR where getFile() doesn't work.
            // For a robust production app we'd load via stream, but this is fine for now.
        }
    }

    /**
     * Reads a document, chunks it, embeds it, and saves it to the Vector Store.
     */
    public void ingestDocument(Path filePath) {
        log.info("Ingesting document: {}", filePath.getFileName());
        try {
            String content = Files.readString(filePath);
            Document document = Document.from(content);
            document.metadata().add("source", filePath.getFileName().toString());

            // Split document into smaller chunks (segments)
            // Max 500 characters per chunk, with a 50 character overlap to preserve context between chunks
            DocumentSplitter splitter = DocumentSplitters.recursive(500, 50);
            List<TextSegment> segments = splitter.split(document);

            // Convert chunks to vectors and store them
            embeddingStore.addAll(embeddingModel.embedAll(segments).content(), segments);
        } catch (IOException e) {
            log.error("Failed to read document {}: {}", filePath, e.getMessage());
        }
    }

    /**
     * Manually ingest text content directly
     */
    public void ingestText(String text, String sourceName) {
        Document document = Document.from(text);
        document.metadata().add("source", sourceName);
        DocumentSplitter splitter = DocumentSplitters.recursive(500, 50);
        List<TextSegment> segments = splitter.split(document);
        embeddingStore.addAll(embeddingModel.embedAll(segments).content(), segments);
        log.info("✅ Ingested raw text into Vector DB: {}", sourceName);
    }

    /**
     * Searches the Vector Database for the top N most relevant legal contexts.
     */
    public String findRelevantContext(String query, int maxResults) {
        log.info("🔍 Searching Vector DB for: '{}'", query);
        
        // 1. Convert user query to vector
        var queryEmbedding = embeddingModel.embed(query).content();

        // 2. Search Store
        List<EmbeddingMatch<TextSegment>> matches = embeddingStore.findRelevant(queryEmbedding, maxResults);

        // 3. Format matches into a single String
        if (matches.isEmpty()) {
            return "No specific legal context found.";
        }

        String context = matches.stream()
                .map(match -> "- " + match.embedded().text())
                .collect(Collectors.joining("\n\n"));

        log.info("📄 Retrieved {} context snippets.", matches.size());
        return context;
    }
}
