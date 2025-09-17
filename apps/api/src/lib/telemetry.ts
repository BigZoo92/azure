// Instrumentation App Insights (événements custom)
import appInsights from "applicationinsights";

let started = false;
export function ai() {
  if (started) return appInsights.defaultClient;
  // Azure injecte APPLICATIONINSIGHTS_CONNECTION_STRING quand l’AI est lié
  const cs =
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING ||
    process.env.APPINSIGHTS_CONNECTIONSTRING ||
    process.env.APPINSIGHTS_INSTRUMENTATIONKEY; // compat

  if (!cs) return null; // pas d'AI → pas d'envoi (ok en local)
  appInsights
    .setup(cs)
    .setAutoCollectRequests(false) // les requêtes HTTP sont déjà collectées par le host Functions
    .setAutoCollectDependencies(true) // utile pour Cosmos, HTTP sortants
    .setAutoCollectExceptions(true)
    .setSendLiveMetrics(true)
    .setAutoCollectPerformance(true)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI)
    .start();
  started = true;
  return appInsights.defaultClient;
}

export function trackVote(userId: string, choice: "yes" | "no") {
  ai()?.trackEvent({
    name: "vote",
    properties: { userId, choice },
  });
}

export function trackLogin(userId: string, provider: "local" | "github") {
  ai()?.trackEvent({
    name: "login",
    properties: { userId, provider },
  });
}

export function trackUserActivity(userId: string, activity: string) {
  ai()?.trackEvent({
    name: "user_activity",
    properties: { userId, activity },
  });
}

export function trackError(e: any, props?: Record<string, any>) {
  ai()?.trackException({
    exception: e instanceof Error ? e : new Error(String(e)),
    properties: props,
  });
}
