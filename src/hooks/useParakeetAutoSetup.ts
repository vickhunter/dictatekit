import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "../components/ui/useToast";
import { useSettingsStore } from "../stores/settingsStore";
import logger from "../utils/logger";

export const DEFAULT_PARAKEET_MODEL = "parakeet-tdt-0.6b-v3";
const SETUP_DONE_KEY = "parakeetAutoSetupDone";

/**
 * One-time, per-install setup that makes Parakeet v3 the engine dictation
 * actually uses, not just the recommended entry in the model picker:
 *
 * - downloads the model in the background when it is missing
 * - switches the local provider to Parakeet once the model is on disk
 *
 * Dictation keeps working the whole time: audioManager falls back to whisper
 * for any recording made while the Parakeet model is not downloaded yet.
 * A failed download leaves the marker unset so the next launch retries.
 */
export function useParakeetAutoSetup() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const useLocalWhisper = useSettingsStore((s) => s.useLocalWhisper);
  const setLocalTranscriptionProvider = useSettingsStore((s) => s.setLocalTranscriptionProvider);
  const setParakeetModel = useSettingsStore((s) => s.setParakeetModel);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    if (typeof window === "undefined" || !window.electronAPI) return;
    if (localStorage.getItem(SETUP_DONE_KEY) === "true") return;
    // Cloud dictation setups are left alone; if the user switches back to
    // local mode this effect re-runs and picks the setup up again.
    if (!useLocalWhisper) return;
    // Brand-new installs choose their engine in onboarding first.
    if (localStorage.getItem("hasCompletedOnboarding") !== "true") return;
    startedRef.current = true;

    let cancelled = false;

    const activateParakeet = () => {
      setLocalTranscriptionProvider("nvidia");
      setParakeetModel(DEFAULT_PARAKEET_MODEL);
      localStorage.setItem(SETUP_DONE_KEY, "true");
    };

    const run = async () => {
      try {
        const status = await window.electronAPI.checkParakeetModelStatus?.(DEFAULT_PARAKEET_MODEL);
        if (cancelled) return;

        if (status?.downloaded) {
          const state = useSettingsStore.getState();
          const alreadyActive =
            state.localTranscriptionProvider === "nvidia" &&
            state.parakeetModel === DEFAULT_PARAKEET_MODEL;
          activateParakeet();
          if (!alreadyActive) {
            toast({
              title: t("parakeetSetup.readyTitle"),
              description: t("parakeetSetup.readyBody"),
              variant: "success",
            });
          }
          return;
        }

        toast({
          title: t("parakeetSetup.downloadingTitle"),
          description: t("parakeetSetup.downloadingBody"),
          duration: 10000,
        });
        const result = await window.electronAPI.downloadParakeetModel?.(DEFAULT_PARAKEET_MODEL);
        if (cancelled) return;

        if (result?.success) {
          activateParakeet();
          toast({
            title: t("parakeetSetup.readyTitle"),
            description: t("parakeetSetup.readyBody"),
            variant: "success",
          });
        } else {
          logger.warn(
            "Parakeet auto-setup download did not complete, will retry next launch",
            { result },
            "models"
          );
        }
      } catch (error) {
        logger.warn(
          "Parakeet auto-setup failed, will retry next launch",
          { error: (error as Error)?.message },
          "models"
        );
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [useLocalWhisper, setLocalTranscriptionProvider, setParakeetModel, t, toast]);
}
