import { createQueryKeys } from "@lukemorales/query-key-factory";
import { request } from "@/lib/api/request";
import { ROUTES } from "@/lib/api/routes";
import type { PlatformAccountsResponse } from "./platforms.types";

class PlatformsService {
  getAccounts = async (): Promise<PlatformAccountsResponse> => {
    try {
      return await request.get<PlatformAccountsResponse>(ROUTES.platforms.accounts);
    } catch (error: unknown) {
      // 404 means the user has no accounts yet — treat as empty list
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as { response?: { status?: number } }).response?.status === 404
      ) {
        return { total: 0, accounts: [] };
      }
      throw error;
    }
  };

  connectTelegram = (botToken: string): Promise<void> =>
    request.post<void>(ROUTES.platforms.telegramConnect, { botToken });

  connectWhatsapp = (accessToken: string, phoneNumberId: string): Promise<void> =>
    request.post<void>(ROUTES.platforms.whatsappConnect, { accessToken, phoneNumberId });
}

export const platformsService = new PlatformsService();

export const platformsQueryKeys = createQueryKeys("platforms", {
  accounts: () => ({
    queryKey: ["list"],
    queryFn: () => platformsService.getAccounts(),
  }),
});
