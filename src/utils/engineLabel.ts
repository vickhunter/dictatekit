import modelRegistryData from "../models/modelRegistryData.json";

/** A downloaded local engine the user can retranscribe saved audio with. */
export interface RetryEngine {
  provider: "whisper" | "nvidia";
  model: string;
  label: string;
}

const PARAKEET_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(
    (modelRegistryData as { parakeetModels?: Record<string, { name?: string }> }).parakeetModels ??
      {}
  ).map(([id, cfg]) => [id, cfg?.name || id])
);

/**
 * Compact human label for the engine that produced a transcription, from the
 * row's stored provider/model. Returns null when nothing was recorded (rows
 * predating the model column).
 */
export function engineLabel(provider: string | null, model: string | null): string | null {
  if (!provider && !model) return null;
  const p = (provider || "").toLowerCase();

  if (p === "local-parakeet" || p === "nvidia") {
    return model ? PARAKEET_NAMES[model] || model : "Parakeet";
  }
  if (p === "local-whisper" || p === "whisper") {
    return model ? `Whisper ${model}` : "Whisper";
  }
  if (p === "dictatekit" || model === "cloud") return "DictateKit Cloud";
  if (p === "self-hosted") return model || "Self-hosted";

  return model || provider;
}
