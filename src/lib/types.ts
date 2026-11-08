// Types des réponses de l'API FastAPI (backend/app/serializers.py). Dates : chaînes ISO 8601 en UTC.

export type Role = "CLIENT" | "PRO" | "ADMIN";
export type AdminRole = "SUPER" | "VERIF" | "SUPPORT" | "MODER";
export type PlanKey = "FREE" | "PRO" | "PREMIUM";

export type User = {
  id: string; email: string; phone: string | null; firstName: string; lastName: string;
  role: Role; adminRole: AdminRole | null; status: "ACTIVE" | "SUSPENDED"; emailVerifiedAt: string | null; createdAt: string;
};

export type Credential = { id: string; type: string; fileName: string; mime: string; size: number; state: "RECEIVED" | "ACCEPTED" | "REFUSED"; reason: string | null };
export type PortfolioItem = { id: string; caption: string; mime: string; createdAt: string };

export type ProPrivate = {
  id: string; statut: "ARCH" | "ING" | "TECH" | "ENT" | null; companyName: string | null;
  state: "DRAFT" | "PENDING" | "MORE" | "VERIFIED" | "REFUSED";
  school: string | null; diploma: string | null; experienceYears: number | null; bio: string | null; software: string | null;
  specialties: string[]; commune: string | null; whatsapp: string | null; visible: boolean; plan: PlanKey; activePlan: PlanKey;
  planUntil: string | null; launchOffer: boolean; featured: boolean; spotlight: boolean; submittedAt: string | null;
  decidedAt: string | null; decisionReason: string | null; createdAt: string; updatedAt: string;
  credentials?: Credential[]; portfolio?: PortfolioItem[];
};

export type ProCard = {
  id: string; name: string; firstName: string; lastName: string; badge: string; statut: ProPrivate["statut"]; companyName: string | null;
  commune: string | null; experienceYears: number | null; bio: string | null; software: string | null; specialties: string[];
  featured: boolean; spotlight: boolean; portfolioCount: number; portfolio: PortfolioItem[]; updatedAt: string;
  rating?: { avg: number | null; count: number };
};
export type PublicReview = { id: string; rating: number; comment: string | null; author: string; createdAt: string };

export type ServiceRequest = {
  id: string; ref: string; title: string; category: string; service: string; buildingType: string; description: string;
  commune: string; district: string | null; landStatus: string; phase: string; levels: string | null; rooms: number | null;
  surface: number | null; dims: string | null; deadline: string; budget: number;
  state: "PENDING" | "PUBLISHED" | "REJECTED" | "CLOSED"; rejectReason: string | null;
  publishedAt: string | null; closedAt: string | null; createdAt: string; conversations?: number; hasPhoto?: boolean;
};

export type Message = { id: string; senderId: string; body: string; createdAt: string };

export type ConversationSummary = {
  id: string; shared: boolean; lastMessageAt: string; unread: boolean; lastMessage: string;
  request: { id: string; ref: string; title: string; commune: string; state: ServiceRequest["state"] };
  other: { name: string; badge: string; statut?: ProPrivate["statut"] };
};

export type ConversationFull = {
  id: string; shared: boolean; sharedAt: string | null; messages: Message[]; request: ServiceRequest;
  review?: { rating: number; comment: string | null } | null; canReview?: boolean;
  other: {
    name: string; badge: string; phone: string | null; commune?: string | null;
    firstName?: string; lastName?: string; statut?: ProPrivate["statut"]; state?: ProPrivate["state"] | null; companyName?: string | null;
    experienceYears?: number | null; bio?: string | null; specialties?: string[]; software?: string | null; portfolio?: PortfolioItem[];
    rating?: { avg: number | null; count: number };
  };
};

export type NotifItem = { id: string; href: string; title: string; sub: string; badge: string; icon?: boolean; ts: number; action: string };
export type Notifs = { title: string; items: NotifItem[]; footer: [string, string]; unread: number; newRequests: number };

export type DossierNext = { title: string; text: string; cta: string | null } | null;

export type Me = { user: User | null; mfa?: boolean; pro?: ProPrivate | null; next?: DossierNext; notifs?: Notifs | null };

export type Ad = { id: string; title: string; text: string; linkLabel: string | null; href: string | null; active: boolean; createdAt: string };

export type HomeData = { requests: ServiceRequest[]; spotlight: ProCard | null; pros: ProCard[]; companies: ProCard[]; ad: Ad | null; ads?: Ad[] };
