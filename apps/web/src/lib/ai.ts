import { ApplicationInsights } from "@microsoft/applicationinsights-web";

export const ai = new ApplicationInsights({
  config: {
    connectionString: import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING,
    enableAutoRouteTracking: true,
  },
});

ai.loadAppInsights();

export function setAuthUser(id: string | null) {
  if (!id) {
    ai.clearAuthenticatedUserContext();
  } else {
    ai.setAuthenticatedUserContext(id);
  }
}
