package com.newwork.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class HuggingFaceService {

    private final WebClient webClient;

    @Value("${huggingface.api.key:}")
    private String apiKey;

    @Value("${huggingface.model:meta-llama/Meta-Llama-3-8B}")
    private String model;

    @Value("${huggingface.timeout:30}")
    private int timeoutSeconds;

    public HuggingFaceService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .baseUrl("https://router.huggingface.co/v1")
                .build();
    }

    public String polishFeedback(String feedback) {
        if (apiKey == null || apiKey.isEmpty()) {
            log.info("HuggingFace API key not configured. Using rule-based improvement.");
            return improveWithPrompt(feedback);
        }

        if (feedback == null || feedback.trim().isEmpty()) {
            return feedback;
        }

        try {
            log.info("Calling HuggingFace API with model: {}", model);
            String polished = callHuggingFaceInferenceApi(feedback)
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .block();

            if (polished != null && !polished.trim().isEmpty() && !polished.equals(feedback)) {
                log.info("Successfully polished feedback using AI");
                return polished;
            } else {
                log.warn("AI returned empty or same result, using rule-based improvement");
                return improveWithPrompt(feedback);
            }
        } catch (WebClientResponseException e) {
            log.error("HuggingFace API error (status {}): {}", e.getStatusCode(), e.getMessage());
            if (e.getStatusCode().value() == 503) {
                log.info("Model is loading, this can take 20-30 seconds on first request");
            }
            return improveWithPrompt(feedback);
        } catch (Exception e) {
            log.error("Error calling HuggingFace API: {} - {}", e.getClass().getSimpleName(), e.getMessage());
            return improveWithPrompt(feedback);
        }
    }

    /**
     * Generate three different polished versions of the feedback for user to choose from
     */
    public List<String> generateFeedbackOptions(String feedback) {
        if (feedback == null || feedback.trim().isEmpty()) {
            return List.of(feedback, feedback, feedback);
        }

        if (apiKey == null || apiKey.isEmpty()) {
            log.info("HuggingFace API key not configured. Using rule-based options.");
            return generateFallbackOptions(feedback);
        }

        try {
            log.info("Generating 3 feedback options using AI");
            List<String> options = callHuggingFaceForOptions(feedback)
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .block();

            if (options != null && options.size() == 3) {
                log.info("Successfully generated 3 feedback options");
                return options;
            } else {
                log.warn("AI returned invalid options, using fallback");
                return generateFallbackOptions(feedback);
            }
        } catch (Exception e) {
            log.error("Error generating feedback options: {} - {}", e.getClass().getSimpleName(), e.getMessage());
            return generateFallbackOptions(feedback);
        }
    }

    private Mono<String> callHuggingFaceInferenceApi(String text) {
        // Build prompt for text improvement
        String prompt = buildPrompt(text);

        // OpenAI-compatible format (new HuggingFace router API)
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);

        // Messages array in OpenAI format
        Map<String, String> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);
        requestBody.put("messages", List.of(userMessage));

        // Optional parameters
        requestBody.put("max_tokens", 150);
        requestBody.put("temperature", 0.7);

        log.debug("Calling HuggingFace API (OpenAI format): /chat/completions with model {}", model);

        return webClient
                .post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, response ->
                    response.bodyToMono(String.class)
                        .flatMap(body -> {
                            log.error("Client error response: {}", body);
                            return Mono.error(new RuntimeException("Client error: " + body));
                        })
                )
                .onStatus(HttpStatusCode::is5xxServerError, response ->
                    response.bodyToMono(String.class)
                        .flatMap(body -> {
                            log.error("Server error response: {}", body);
                            return Mono.error(new RuntimeException("Server error: " + body));
                        })
                )
                .bodyToMono(JsonNode.class)
                .map(this::extractGeneratedText)
                .doOnError(e -> log.error("API call failed: {}", e.getMessage()));
    }

    private String buildPrompt(String feedback) {
        // For chat models, provide clear instruction
        return String.format(
            "Rewrite the following employee feedback to be more professional, clear, and constructive. " +
            "Keep it concise and maintain the original meaning and return only the rewritten version.\n\n" +
            "Feedback: %s\n\n" +
            "Professional version:",
            feedback
        );
    }

    private String extractGeneratedText(JsonNode response) {
        try {
            log.debug("Parsing response: {}", response);

            // OpenAI-compatible format: { "choices": [{ "message": { "content": "..." } }] }
            if (response.has("choices")) {
                JsonNode choices = response.get("choices");
                if (choices.isArray() && choices.size() > 0) {
                    JsonNode firstChoice = choices.get(0);
                    if (firstChoice.has("message")) {
                        JsonNode message = firstChoice.get("message");
                        if (message.has("content")) {
                            String text = message.get("content").asText();
                            return cleanGeneratedText(text);
                        }
                    }
                }
            }

            // Legacy format support (old inference API)
            // Handle array response format
            if (response.isArray() && response.size() > 0) {
                JsonNode firstResult = response.get(0);

                // Check for summary_text (BART, summarization models)
                if (firstResult.has("summary_text")) {
                    String text = firstResult.get("summary_text").asText();
                    return cleanGeneratedText(text);
                }

                // Check for generated_text (generation models)
                if (firstResult.has("generated_text")) {
                    String text = firstResult.get("generated_text").asText();
                    return cleanGeneratedText(text);
                }
            }

            // Handle error in response
            if (response.has("error")) {
                String error = response.get("error").asText();
                log.warn("API returned error: {}", error);
                throw new RuntimeException("API error: " + error);
            }

            log.warn("Unexpected response format: {}", response.toString());
            throw new RuntimeException("Unexpected response format");

        } catch (Exception e) {
            log.error("Error parsing response: {}", e.getMessage());
            throw new RuntimeException("Failed to parse API response", e);
        }
    }

    private String cleanGeneratedText(String text) {
        if (text == null || text.isEmpty()) {
            return text;
        }

        // Remove any prompt repetition
        String[] parts = text.split("Professional feedback:", 2);
        if (parts.length > 1) {
            text = parts[1];
        }

        // Clean up the text
        text = text.trim();

        // Remove quotes if the model wrapped it
        if (text.startsWith("\"") && text.endsWith("\"")) {
            text = text.substring(1, text.length() - 1);
        }

        return text;
    }

    /**
     * Fallback method to improve feedback without API call
     */
    private String improveWithPrompt(String feedback) {
        // Simple rule-based improvement
        String improved = feedback.trim();

        // Ensure it starts with a capital letter
        if (!improved.isEmpty() && Character.isLowerCase(improved.charAt(0))) {
            improved = Character.toUpperCase(improved.charAt(0)) + improved.substring(1);
        }

        // Ensure it ends with proper punctuation
        if (!improved.isEmpty() && !improved.matches(".*[.!?]$")) {
            improved += ".";
        }

        // Add professional context if too short
        if (improved.split("\\s+").length < 5) {
            improved = "Professional feedback: " + improved;
        }

        return improved;
    }

    private Mono<List<String>> callHuggingFaceForOptions(String text) {
        // Build prompt for generating three different versions
        String prompt = buildOptionsPrompt(text);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);

        Map<String, String> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);
        requestBody.put("messages", List.of(userMessage));

        requestBody.put("max_tokens", 400); // Increased for 3 options
        requestBody.put("temperature", 0.8); // Slightly higher for variety

        log.debug("Calling HuggingFace API for 3 options");

        return webClient
                .post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, response ->
                    response.bodyToMono(String.class)
                        .flatMap(body -> {
                            log.error("Client error response: {}", body);
                            return Mono.error(new RuntimeException("Client error: " + body));
                        })
                )
                .onStatus(HttpStatusCode::is5xxServerError, response ->
                    response.bodyToMono(String.class)
                        .flatMap(body -> {
                            log.error("Server error response: {}", body);
                            return Mono.error(new RuntimeException("Server error: " + body));
                        })
                )
                .bodyToMono(JsonNode.class)
                .map(this::extractOptionsFromResponse)
                .doOnError(e -> log.error("API call failed: {}", e.getMessage()));
    }

    private String buildOptionsPrompt(String feedback) {
        return String.format(
            "Generate exactly 3 different professional versions of the following employee feedback. " +
            "Each version should be clear, constructive, and professional, but with slightly different wording and tone. " +
            "Format your response as:\n" +
            "OPTION 1: [first version]\n" +
            "OPTION 2: [second version]\n" +
            "OPTION 3: [third version]\n\n" +
            "Original feedback: %s",
            feedback
        );
    }

    private List<String> extractOptionsFromResponse(JsonNode response) {
        try {
            log.debug("Parsing options response: {}", response);

            if (response.has("choices")) {
                JsonNode choices = response.get("choices");
                if (choices.isArray() && choices.size() > 0) {
                    JsonNode firstChoice = choices.get(0);
                    if (firstChoice.has("message")) {
                        JsonNode message = firstChoice.get("message");
                        if (message.has("content")) {
                            String content = message.get("content").asText();
                            return parseOptions(content);
                        }
                    }
                }
            }

            log.warn("Unexpected response format for options");
            throw new RuntimeException("Unexpected response format");

        } catch (Exception e) {
            log.error("Error parsing options response: {}", e.getMessage());
            throw new RuntimeException("Failed to parse API response", e);
        }
    }

    private List<String> parseOptions(String content) {
        // Try to extract the three options from the response
        String[] lines = content.split("\n");
        String option1 = "";
        String option2 = "";
        String option3 = "";

        for (String line : lines) {
            line = line.trim();
            if (line.startsWith("OPTION 1:") || line.startsWith("Option 1:") || line.startsWith("1.")) {
                option1 = line.replaceFirst("^(OPTION 1:|Option 1:|1\\.)", "").trim();
            } else if (line.startsWith("OPTION 2:") || line.startsWith("Option 2:") || line.startsWith("2.")) {
                option2 = line.replaceFirst("^(OPTION 2:|Option 2:|2\\.)", "").trim();
            } else if (line.startsWith("OPTION 3:") || line.startsWith("Option 3:") || line.startsWith("3.")) {
                option3 = line.replaceFirst("^(OPTION 3:|Option 3:|3\\.)", "").trim();
            }
        }

        // If parsing failed, try splitting by newlines and take first 3 non-empty lines
        if (option1.isEmpty() || option2.isEmpty() || option3.isEmpty()) {
            List<String> nonEmptyLines = java.util.Arrays.stream(lines)
                    .map(String::trim)
                    .filter(l -> !l.isEmpty() && !l.toLowerCase().startsWith("option"))
                    .limit(3)
                    .collect(java.util.stream.Collectors.toList());

            if (nonEmptyLines.size() >= 3) {
                return List.of(
                        cleanGeneratedText(nonEmptyLines.get(0)),
                        cleanGeneratedText(nonEmptyLines.get(1)),
                        cleanGeneratedText(nonEmptyLines.get(2))
                );
            }
        }

        return List.of(
                cleanGeneratedText(option1),
                cleanGeneratedText(option2),
                cleanGeneratedText(option3)
        );
    }

    private List<String> generateFallbackOptions(String feedback) {
        // Generate 3 simple variations
        String base = improveWithPrompt(feedback);

        String option1 = base;
        String option2 = "I would like to provide feedback: " + base;
        String option3 = base + " Thank you for your consideration.";

        return List.of(option1, option2, option3);
    }
}

