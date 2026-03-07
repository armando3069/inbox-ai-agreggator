export interface ContactInfoPatch {
  lifecycleStatus?: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactCountry?: string | null;
  contactLanguage?: string | null;
}

export interface ConversationContactInfo {
  id: number;
  lifecycle_status: string;
  contact_email: string | null;
  contact_phone: string | null;
  contact_country: string | null;
  contact_language: string | null;
}
