/**
 * Gemini AI Service for DNS Sentinel.
 * Provides system health analysis using Google's Gemini model.
 * @module services/geminiService
 */

import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeminiAnalysisResult, Region } from "../types";

const apiKey = process.env.API_KEY || "mock_key_for_demo"; 
const ai = new GoogleGenAI({ apiKey });

/**
 * JSON schema for structured Gemini responses.
 * Ensures consistent output format for infrastructure decisions.
 */
const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    status: { type: Type.STRING, enum: ['HEALTHY', 'CRITICAL', 'WARNING'] },
    reasoning: { type: Type.STRING },
    recommendedAction: { type: Type.STRING, enum: ['NONE', 'FAILOVER', 'SCALE_UP'] }
  },
  required: ['status', 'reasoning', 'recommendedAction']
};

/**
 * Analyzes system health using Gemini AI.
 * 
 * This function sends DNS probe telemetry to Gemini for analysis.
 * The AI evaluates latency patterns and determines if remediation is needed.
 * Falls back to local heuristics if the API is unavailable.
 * 
 * @param regions - Array of region data with latency and status
 * @returns Promise resolving to the analysis result
 * 
 * @example
 * ```ts
 * const regions = [
 *   { id: 'us-central1', name: 'US', latency: 500, status: 'DEGRADED' },
 *   { id: 'europe-west1', name: 'EU', latency: 800, status: 'TIMEOUT' }
 * ];
 * const result = await analyzeSystemHealth(regions);
 * // result.status === 'CRITICAL'
 * // result.recommendedAction === 'FAILOVER'
 * ```
 */
export const analyzeSystemHealth = async (regions: Region[]): Promise<GeminiAnalysisResult> => {
  // In a real scenario without the API key, we mock the response to keep the UI functional for the demo.
  if (apiKey === "mock_key_for_demo") {
     return mockGeminiResponse(regions);
  }

  try {
    const prompt = `
      You are an autonomous infrastructure reliability engineer. 
      Analyze the following DNS probe data from 3 global regions.
      
      Normal thresholds:
      - US: < 100ms
      - EU: < 150ms
      - Asia: < 250ms
      
      If multiple regions show high latency (>300ms) or TIMEOUT, declare CRITICAL status and recommend FAILOVER.
      
      Current Metrics:
      ${JSON.stringify(regions, null, 2)}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1, // Low temperature for deterministic infrastructure decisions
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    
    return JSON.parse(text) as GeminiAnalysisResult;

  } catch (error) {
    console.warn("Gemini API call failed (likely missing key or network), falling back to local heuristic.", error);
    return mockGeminiResponse(regions);
  }
};

/**
 * Local fallback "Brain" for when the Gemini API is unavailable.
 * Uses simple heuristics based on latency thresholds.
 * 
 * @param regions - Array of region data with latency and status
 * @returns Analysis result based on local heuristics
 */
const mockGeminiResponse = (regions: Region[]): GeminiAnalysisResult => {
  const criticalCount = regions.filter(r => r.status === 'TIMEOUT' || r.latency > 400).length;
  
  if (criticalCount >= 1) {
    return {
      status: 'CRITICAL',
      reasoning: `Detected critical failure in ${criticalCount} region(s). Latency spikes exceed 400ms or timeouts observed. Primary path compromised.`,
      recommendedAction: 'FAILOVER'
    };
  }
  
  return {
    status: 'HEALTHY',
    reasoning: 'Global latency within nominal operational parameters. No anomalies detected in ingress traffic.',
    recommendedAction: 'NONE'
  };
};
