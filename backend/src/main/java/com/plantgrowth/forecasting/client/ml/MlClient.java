package com.plantgrowth.forecasting.client.ml;

import java.time.Duration;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Component
public class MlClient {
    private final WebClient web;

    public MlClient(@Value("${app.ml-service-base-url}") String baseUrl) {
        this.web = WebClient.builder().baseUrl(baseUrl).build();
    }

    public Map request(Map body) {
        try {
            return web.post().uri("/predict").bodyValue(body).retrieve().bodyToMono(Map.class).block(Duration.ofSeconds(20));
        } catch (WebClientResponseException exception) {
            String response = exception.getResponseBodyAsString();
            throw new IllegalArgumentException("The selected model is not ready for this request. " + response);
        } catch (Exception exception) {
            throw new IllegalArgumentException("ML service is unavailable. Start the Python ML service on port 8000 and load a trained artifact.");
        }
    }

    public Object models() {
        return web.get().uri("/models").retrieve().bodyToMono(Object.class).block(Duration.ofSeconds(5));
    }
}
