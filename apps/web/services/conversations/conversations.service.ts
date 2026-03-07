import { createQueryKeys } from "@lukemorales/query-key-factory";
import { request } from "@/lib/api/request";
import { ROUTES } from "@/lib/api/routes";
import type { ContactInfoPatch, ConversationContactInfo } from "./conversations.types";

class ConversationsService {
  updateContactInfo = (
    id: number,
    patch: ContactInfoPatch,
  ): Promise<ConversationContactInfo> =>
    request.patch<ConversationContactInfo>(ROUTES.conversations.contactInfo(id), patch);
}

export const conversationsService = new ConversationsService();

export const conversationsQueryKeys = createQueryKeys("conversations", {
  contactInfo: (id: number) => ({
    queryKey: [id],
    queryFn: () =>
      request.get<ConversationContactInfo>(ROUTES.conversations.contactInfo(id)),
  }),
});
