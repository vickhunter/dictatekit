import { useTranslation } from "react-i18next";
import { useUsage } from "../hooks/useUsage";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";

/**
 * Factual usage readout for signed-in DictateKit Cloud accounts.
 *
 * Reports what the cloud plan allows and how much of it is left. It deliberately
 * carries no upgrade CTA and fires no "approaching limit" nag — see
 * src/config/promotions.ts. Local transcription is unlimited and never counted here.
 */
export default function UsageDisplay() {
  const { t } = useTranslation();
  const usage = useUsage();

  if (!usage) return null;

  // Paid plan or trial — status only.
  if (usage.isSubscribed) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{t("usage.yourPlan")}</span>
          {usage.isTrial ? (
            <Badge variant="outline" className="text-primary border-primary/30">
              {t("usage.trial", { days: usage.trialDaysLeft, count: usage.trialDaysLeft })}
            </Badge>
          ) : (
            <Badge variant="success">
              {usage.plan === "business" ? t("usage.business") : t("usage.pro")}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {usage.isTrial ? t("usage.unlimitedTrial") : t("usage.unlimited")}
        </p>
        {!usage.isTrial && (
          <Button variant="outline" size="sm" onClick={() => usage.openBillingPortal()}>
            {t("usage.manageSubscription")}
          </Button>
        )}
      </div>
    );
  }

  // Free plan — meter only.
  const percentage = usage.limit > 0 ? Math.min(100, (usage.wordsUsed / usage.limit) * 100) : 0;
  const progressColor =
    percentage >= 100
      ? "[&>div]:bg-destructive"
      : percentage >= 80
        ? "[&>div]:bg-warning"
        : "[&>div]:bg-primary";

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{t("usage.weeklyUsage")}</span>
        {usage.isOverLimit ? (
          <Badge variant="warning">{t("usage.limitReached")}</Badge>
        ) : (
          <Badge variant="outline">{t("usage.free")}</Badge>
        )}
      </div>

      <div className="space-y-1.5">
        <Progress
          value={percentage}
          className={`h-2 transition-colors duration-500 ${progressColor}`}
        />
        <div className="flex items-center justify-between">
          <span className="text-sm tabular-nums text-muted-foreground">
            {usage.wordsUsed.toLocaleString()} / {usage.limit.toLocaleString()}
          </span>
          {usage.isApproachingLimit ? (
            <span className="text-xs text-warning">
              {t("usage.wordsRemaining", {
                count: usage.wordsRemaining,
                remaining: usage.wordsRemaining.toLocaleString(),
              })}
            </span>
          ) : (
            !usage.isOverLimit && (
              <span className="text-xs text-muted-foreground">{t("usage.rollingLimit")}</span>
            )
          )}
        </div>
      </div>

      {usage.isOverLimit && (
        <p className="text-xs text-muted-foreground">{t("usage.cloudLimitReachedHint")}</p>
      )}
    </div>
  );
}
