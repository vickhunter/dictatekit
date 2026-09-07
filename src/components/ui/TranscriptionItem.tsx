import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./button";
import { Tooltip } from "./tooltip";
import {
  Copy,
  Trash2,
  FileText,
  FolderOpen,
  RotateCcw,
  Loader2,
  AlertCircle,
  ArchiveRestore,
} from "lucide-react";
import type {
  TranscriptionItem as TranscriptionItemType,
  TranscriptionErrorCode,
} from "../../types/electron";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./dropdown-menu";
import { cn } from "../lib/utils";
import { getCachedPlatform } from "../../utils/platform";
import { formatMmSs } from "../../utils/formatDuration";
import { engineLabel, type RetryEngine } from "../../utils/engineLabel";

const platform = getCachedPlatform();

function getShowInFolderKey(): string {
  if (platform === "win32") return "controlPanel.history.showInFolderWindows";
  if (platform === "linux") return "controlPanel.history.showInFolderLinux";
  return "controlPanel.history.showInFolder";
}

interface TranscriptionItemProps {
  item: TranscriptionItemType;
  onCopy: (text: string) => void;
  onDelete: (id: number) => void;
  onShowAudioInFolder?: (id: number) => void;
  onRetryTranscription?: (
    id: number,
    options?: { isRecover?: boolean; engine?: RetryEngine }
  ) => Promise<void>;
  onOpenSettings?: () => void;
  /** Downloaded local engines offered when retrying from saved audio. */
  retryEngines?: RetryEngine[];
}

export default function TranscriptionItem({
  item,
  onCopy,
  onDelete,
  onShowAudioInFolder,
  onRetryTranscription,
  onOpenSettings,
  retryEngines = [],
}: TranscriptionItemProps) {
  const { t, i18n } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const timestampSource = item.timestamp.endsWith("Z") ? item.timestamp : `${item.timestamp}Z`;
  const timestampDate = new Date(timestampSource);
  const formattedTime = Number.isNaN(timestampDate.getTime())
    ? ""
    : timestampDate.toLocaleTimeString(i18n.language, {
        hour: "2-digit",
        minute: "2-digit",
      });

  const handleRetry = async (engine?: RetryEngine) => {
    if (isRetrying || !onRetryTranscription) return;
    setIsRetrying(true);
    try {
      await onRetryTranscription(item.id, { isRecover: item.status === "discarded", engine });
    } finally {
      setIsRetrying(false);
    }
  };

  const isFailed = item.status === "failed";
  const isDiscarded = item.status === "discarded";
  const discardedDuration =
    item.audio_duration_ms && item.audio_duration_ms > 0
      ? formatMmSs(Math.round(item.audio_duration_ms / 1000))
      : null;
  const hasRawText = item.raw_text !== null;
  const hasAudio = item.has_audio === 1;
  const showUtilityGroup = hasRawText || hasAudio;

  const errorCode = item.error_code as TranscriptionErrorCode;
  const isConfigError =
    errorCode === "API_KEY_MISSING" ||
    errorCode === "INVALID_KEY" ||
    errorCode === "MODEL_NOT_AVAILABLE";
  const isLimitError = errorCode === "LIMIT_REACHED";
  const isOfflineError = errorCode === "OFFLINE";

  const engineName = engineLabel(item.provider ?? null, item.model ?? null);

  const renderRetryControl = (destructive: boolean) => {
    const tooltipKey =
      item.route_kind === "translation"
        ? "controlPanel.history.retryTranslationMode"
        : "controlPanel.history.retryTranscription";
    const buttonClass = destructive
      ? "h-6 w-6 rounded-sm text-destructive hover:text-destructive hover:bg-destructive/10"
      : "h-6 w-6 rounded-sm text-muted-foreground hover:text-primary hover:bg-primary/10";
    const icon = isRetrying ? (
      <Loader2 size={12} className="animate-spin" />
    ) : (
      <RotateCcw size={12} />
    );

    // Translation retries re-run the cleanup+translate chain; keep those
    // single-action so the engine menu never bypasses that pipeline.
    if (retryEngines.length === 0 || item.route_kind === "translation") {
      return (
        <Tooltip content={t(tooltipKey)}>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleRetry()}
            disabled={isRetrying}
            className={buttonClass}
          >
            {icon}
          </Button>
        </Tooltip>
      );
    }

    return (
      <DropdownMenu>
        <Tooltip content={t(tooltipKey)}>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" disabled={isRetrying} className={buttonClass}>
              {icon}
            </Button>
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem onClick={() => handleRetry()}>
            {t("controlPanel.history.retryMenu.currentEngine")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {t("controlPanel.history.retryMenu.downloadedModels")}
          </DropdownMenuLabel>
          {retryEngines.map((engine) => (
            <DropdownMenuItem
              key={`${engine.provider}:${engine.model}`}
              onClick={() => handleRetry(engine)}
            >
              {engine.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div
      className={cn(
        "group rounded-md border border-l-2 px-3 py-2.5 transition-colors duration-150",
        isFailed
          ? "border-destructive/30 bg-destructive/5 hover:bg-destructive/10"
          : isDiscarded
            ? "border-border/30 bg-muted/20 hover:bg-muted/30 opacity-80"
            : "border-border/40 dark:border-border-subtle/60 bg-card/50 dark:bg-surface-2/60 hover:bg-muted/30 dark:hover:bg-surface-2/80",
        // Subtle left accent for translation records; transparent keeps others pixel-aligned.
        item.route_kind === "translation"
          ? "border-l-primary/70 dark:border-l-primary/70"
          : "border-l-transparent dark:border-l-transparent"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        {formattedTime && (
          <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums pt-0.5">
            {formattedTime}
          </span>
        )}

        {isFailed ? (
          <div className="flex-1 min-w-0 flex items-start gap-2">
            <AlertCircle size={14} className="shrink-0 text-destructive mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm text-destructive font-medium">
                {t("controlPanel.history.transcriptionFailed")}
              </p>
              {item.error_message && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {item.error_message}
                </p>
              )}
              {isConfigError && (
                <p className="text-xs text-muted-foreground mt-1">
                  {hasAudio ? (
                    <>
                      <button
                        onClick={() => onOpenSettings?.()}
                        className="text-primary hover:underline cursor-pointer"
                      >
                        {t("controlPanel.history.failedCtaSettings")}
                      </button>{" "}
                      {t("controlPanel.history.failedCtaAndRetry")}
                    </>
                  ) : (
                    <button
                      onClick={() => onOpenSettings?.()}
                      className="text-primary hover:underline cursor-pointer"
                    >
                      {t("controlPanel.history.failedCtaSettingsOnly")}
                    </button>
                  )}
                </p>
              )}
              {isLimitError && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t("controlPanel.history.failedLimitReached")}
                </p>
              )}
              {isOfflineError && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t("controlPanel.history.failedOffline")}
                </p>
              )}
            </div>
          </div>
        ) : isDiscarded ? (
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span className="shrink-0 rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {t("controlPanel.history.discarded.badge")}
            </span>
            <span className="text-sm text-muted-foreground truncate">
              {discardedDuration
                ? t("controlPanel.history.discarded.recordingWithDuration", {
                    duration: discardedDuration,
                  })
                : t("controlPanel.history.discarded.recording")}
            </span>
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <p className="text-foreground text-sm leading-normal wrap-break-word whitespace-pre-wrap">
              {item.text}
            </p>
            {engineName && (
              <span className="mt-1 inline-block rounded-sm bg-muted/60 px-1 py-px font-mono text-[9.5px] uppercase tracking-wide text-muted-foreground/70">
                {engineName}
              </span>
            )}
          </div>
        )}

        <div
          className={cn(
            "flex items-center gap-0.5 shrink-0 transition-opacity duration-150",
            isFailed || isDiscarded ? "opacity-100" : isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          {isDiscarded && hasAudio && (
            <Tooltip content={t("controlPanel.history.discarded.recover")}>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleRetry()}
                disabled={isRetrying}
                className="h-6 w-6 rounded-sm text-muted-foreground hover:text-primary hover:bg-primary/10"
              >
                {isRetrying ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <ArchiveRestore size={12} />
                )}
              </Button>
            </Tooltip>
          )}
          {isFailed && hasAudio && renderRetryControl(true)}
          {!isFailed && !isDiscarded && hasRawText && (
            <Tooltip content={t("controlPanel.history.viewRawTranscript")}>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                  "h-6 w-6 rounded-sm text-muted-foreground hover:text-primary hover:bg-primary/10",
                  isExpanded && "text-primary"
                )}
              >
                <FileText size={12} />
              </Button>
            </Tooltip>
          )}
          {hasAudio && (
            <Tooltip content={t(getShowInFolderKey())}>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onShowAudioInFolder?.(item.id)}
                className="h-6 w-6 rounded-sm text-muted-foreground hover:text-primary hover:bg-primary/10"
              >
                <FolderOpen size={12} />
              </Button>
            </Tooltip>
          )}
          {!isFailed && !isDiscarded && hasAudio && renderRetryControl(false)}
          {showUtilityGroup && <div className="w-px h-3 bg-border/30" />}
          {!isFailed && !isDiscarded && (
            <Tooltip content={t("controlPanel.history.copyText")}>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onCopy(item.text)}
                className="h-6 w-6 rounded-sm text-muted-foreground hover:text-foreground hover:bg-foreground/10"
              >
                <Copy size={12} />
              </Button>
            </Tooltip>
          )}
          <Tooltip content={t("controlPanel.history.deleteItem")}>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(item.id)}
              className="h-6 w-6 rounded-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 size={12} />
            </Button>
          </Tooltip>
        </div>
      </div>

      {!isFailed && !isDiscarded && (
        <div
          className={cn(
            "overflow-hidden transition-all duration-200",
            isExpanded ? "max-h-96" : "max-h-0"
          )}
        >
          <div className="border-t border-border/20 mt-2 pt-2">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              {t("controlPanel.history.rawTranscript")}
            </span>
            <p className="text-xs text-muted-foreground/80 leading-relaxed mt-1">{item.raw_text}</p>
            {item.raw_text === item.text && (
              <p className="text-[10px] text-muted-foreground/50 italic mt-1">
                {t("controlPanel.history.noAiProcessing")}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
