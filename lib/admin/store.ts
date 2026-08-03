import { promises as fs } from "fs";
import path from "path";
import { formatRand } from "@/lib/admin/format";
import {
  defaultPackages,
  type CareerPackage,
} from "@/lib/packages";
import {
  sbAddCheckoutOrder,
  sbDeletePackage,
  sbGetPackage,
  sbGetPopup,
  sbListCustomers,
  sbListOrders,
  sbListPackages,
  sbUpdateOrderStatus,
  sbUpdatePopup,
  sbUpsertPackage,
} from "@/lib/admin/supabase-data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export { formatRand };
export type { CareerPackage };

export type OrderStatus = "pending" | "in_progress" | "completed" | "cancelled";

export type AdminOrder = {
  id: string;
  orderNumber: string;
  createdAt: string;
  completedAt?: string | null;
  firstName: string;
  surname: string;
  email: string;
  whatsapp: string;
  location: string;
  country: string;
  packageSlug: string;
  packageName: string;
  cvColor?: string | null;
  cvUrl?: string | null;
  pictureUrl?: string | null;
  amount: number;
  status: OrderStatus;
  assignedWriter?: string | null;
};

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  country: string;
  orders: number;
  createdAt: string;
};

export type AdminWriter = {
  id: string;
  name: string;
  email: string;
  activeOrders: number;
  completed: number;
  avgTurnaroundDays: number;
  totalRevenue: number;
};

export type AdminRecruiter = {
  id: string;
  name: string;
  company: string;
  email: string;
  active: boolean;
};

export type AdminJobSeeker = {
  id: string;
  name: string;
  email: string;
  targetRole: string;
  country: string;
};

export type AdminJobPost = {
  id: string;
  title: string;
  company: string;
  location: string;
  status: "open" | "closed";
  postedAt: string;
};

export type AdminSubscription = {
  id: string;
  customer: string;
  plan: string;
  status: "active" | "paused" | "cancelled";
  renewsAt: string;
};

export type AdminPlan = {
  id: string;
  name: string;
  price: number;
  interval: "monthly" | "yearly";
  features: string[];
};

export type AdminReview = {
  id: string;
  customer: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type AdminPromotion = {
  id: string;
  code: string;
  discountPercent: number;
  active: boolean;
  expiresAt: string;
};

export type SitePopup = {
  active: boolean;
  title: string;
  message: string;
  imageUrl?: string | null;
  ctaLabel?: string;
  ctaHref?: string;
  updatedAt: string;
};

export type AdminStore = {
  orders: AdminOrder[];
  customers: AdminCustomer[];
  writers: AdminWriter[];
  recruiters: AdminRecruiter[];
  jobSeekers: AdminJobSeeker[];
  jobPosts: AdminJobPost[];
  subscriptions: AdminSubscription[];
  plans: AdminPlan[];
  reviews: AdminReview[];
  promotions: AdminPromotion[];
  packages: CareerPackage[];
  popup: SitePopup;
  notifications: number;
};

const STORE_PATH = path.join(process.cwd(), "data", "admin-store.json");

function seedStore(): AdminStore {
  return {
    writers: [
      {
        id: "w1",
        name: "Sherley Dlamini",
        email: "cvrevamping@creative-cv.co.za",
        activeOrders: 0,
        completed: 0,
        avgTurnaroundDays: 0,
        totalRevenue: 0,
      },
      {
        id: "w2",
        name: "Thabo Molefe",
        email: "thabo@talentcrafters.co.za",
        activeOrders: 0,
        completed: 0,
        avgTurnaroundDays: 0,
        totalRevenue: 0,
      },
      {
        id: "w3",
        name: "Amina Hassan",
        email: "amina@talentcrafters.co.za",
        activeOrders: 0,
        completed: 0,
        avgTurnaroundDays: 0,
        totalRevenue: 0,
      },
    ],
    orders: [],
    customers: [],
    recruiters: [],
    jobSeekers: [],
    jobPosts: [],
    subscriptions: [],
    plans: [
      {
        id: "p1",
        name: "Career Boost Monthly",
        price: 499,
        interval: "monthly",
        features: ["CV refresh", "LinkedIn tips", "Job alerts"],
      },
      {
        id: "p2",
        name: "Executive Annual",
        price: 4999,
        interval: "yearly",
        features: ["Priority writing", "Interview prep", "Recruiter intros"],
      },
    ],
    reviews: [],
    promotions: [],
    packages: structuredClone(defaultPackages),
    popup: defaultPopup(),
    notifications: 0,
  };
}

function defaultPopup(): SitePopup {
  return {
    active: false,
    title: "Welcome to Talent Crafters",
    message:
      "Explore our Career Development packages — ATS-friendly CVs for every stage of your journey.",
    imageUrl: null,
    ctaLabel: "View packages",
    ctaHref: "/packages",
    updatedAt: new Date().toISOString(),
  };
}

function normalizePackage(pkg: CareerPackage): CareerPackage {
  const quoteAmount =
    typeof pkg.quoteAmount === "number" && Number.isFinite(pkg.quoteAmount)
      ? pkg.quoteAmount
      : 1500;
  return {
    ...pkg,
    quoteAmount,
    // Keep marketing label in sync with the amount shown publicly (incl. geo conversion baseline).
    priceLabel: priceLabelFromQuote(quoteAmount),
    active: pkg.active !== false,
    includes: Array.isArray(pkg.includes) ? pkg.includes.filter(Boolean) : [],
  };
}

function priceLabelFromQuote(amount: number) {
  return `R${Math.round(amount).toLocaleString("en-ZA")}`;
}

function ensurePackages(store: AdminStore) {
  if (!Array.isArray(store.packages) || store.packages.length === 0) {
    store.packages = structuredClone(defaultPackages);
  } else {
    store.packages = store.packages.map(normalizePackage);
  }
}

function ensurePopup(store: AdminStore) {
  if (!store.popup || typeof store.popup !== "object") {
    store.popup = defaultPopup();
    return;
  }
  store.popup = {
    active: Boolean(store.popup.active),
    title: store.popup.title || defaultPopup().title,
    message: store.popup.message || defaultPopup().message,
    imageUrl: store.popup.imageUrl || null,
    ctaLabel: store.popup.ctaLabel || "",
    ctaHref: store.popup.ctaHref || "",
    updatedAt: store.popup.updatedAt || new Date().toISOString(),
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __tcAdminStore: AdminStore | undefined;
}

async function readFromDisk(): Promise<AdminStore | null> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as AdminStore;
  } catch {
    return null;
  }
}

async function writeToDisk(store: AdminStore) {
  try {
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
  } catch (err) {
    console.warn("[admin-store] disk write failed — using memory only", err);
  }
}

export async function getStore(): Promise<AdminStore> {
  if (globalThis.__tcAdminStore) {
    ensurePackages(globalThis.__tcAdminStore);
    ensurePopup(globalThis.__tcAdminStore);
    if (isSupabaseConfigured()) {
      const [orders, customers, packages, popup] = await Promise.all([
        sbListOrders(),
        sbListCustomers(),
        sbListPackages(true),
        sbGetPopup(),
      ]);
      if (orders) globalThis.__tcAdminStore.orders = orders;
      if (customers) globalThis.__tcAdminStore.customers = customers;
      if (packages) globalThis.__tcAdminStore.packages = packages;
      if (popup) globalThis.__tcAdminStore.popup = popup;
    }
    globalThis.__tcAdminStore.notifications = getAccurateNotificationCount(
      globalThis.__tcAdminStore,
    );
    return globalThis.__tcAdminStore;
  }
  const disk = await readFromDisk();
  const store = disk || seedStore();
  // Keep only real operational lists accurate — clear outdated demo filler once.
  if (
    store.notifications === 9 ||
    (store.orders.length === 0 && store.customers.length === 0 && store.writers.some((w) => w.completed > 0))
  ) {
    store.writers = seedStore().writers;
    store.recruiters = [];
    store.jobSeekers = [];
    store.jobPosts = [];
    store.subscriptions = [];
    store.reviews = [];
    store.promotions = [];
  }
  ensurePackages(store);
  ensurePopup(store);

  if (isSupabaseConfigured()) {
    const [orders, customers, packages, popup] = await Promise.all([
      sbListOrders(),
      sbListCustomers(),
      sbListPackages(true),
      sbGetPopup(),
    ]);
    if (orders) store.orders = orders;
    if (customers) store.customers = customers;
    if (packages) store.packages = packages;
    if (popup) store.popup = popup;
  }

  store.notifications = getAccurateNotificationCount(store);
  globalThis.__tcAdminStore = store;
  await writeToDisk(store);
  return store;
}

export async function listPackages(options?: { includeInactive?: boolean }) {
  const fromSb = await sbListPackages(Boolean(options?.includeInactive));
  if (fromSb) {
    if (options?.includeInactive) return fromSb;
    return fromSb.filter((pkg) => pkg.active !== false);
  }
  const store = await getStore();
  ensurePackages(store);
  if (options?.includeInactive) return store.packages;
  return store.packages.filter((pkg) => pkg.active !== false);
}

export async function getPackageBySlug(
  slug: string,
  options?: { includeInactive?: boolean },
) {
  const fromSb = await sbGetPackage(slug, Boolean(options?.includeInactive));
  if (fromSb) return fromSb;
  if (fromSb === undefined) return undefined;

  const store = await getStore();
  ensurePackages(store);
  const pkg = store.packages.find((p) => p.slug === slug);
  if (!pkg) return undefined;
  if (!options?.includeInactive && pkg.active === false) return undefined;
  return pkg;
}

export async function upsertPackage(
  input: CareerPackage,
  options?: { previousSlug?: string },
) {
  const next = normalizePackage(input);
  if (!next.slug || !next.name.trim()) {
    throw new Error("Package name and slug are required.");
  }

  const fromSb = await sbUpsertPackage(next, options?.previousSlug);
  if (fromSb) {
    if (globalThis.__tcAdminStore) {
      ensurePackages(globalThis.__tcAdminStore);
      const previousSlug = options?.previousSlug || next.slug;
      const idx = globalThis.__tcAdminStore.packages.findIndex(
        (p) => p.slug === previousSlug || p.slug === next.slug,
      );
      if (idx >= 0) globalThis.__tcAdminStore.packages[idx] = fromSb;
      else globalThis.__tcAdminStore.packages.push(fromSb);
    }
    // Keep local fallback in sync for offline/dev reads.
    try {
      const store = await getStore();
      ensurePackages(store);
      const previousSlug = options?.previousSlug || next.slug;
      const existingIndex = store.packages.findIndex(
        (p) => p.slug === previousSlug || p.slug === next.slug,
      );
      if (existingIndex >= 0) store.packages[existingIndex] = fromSb;
      else store.packages.push(fromSb);
      await saveStore(store);
    } catch {
      // Non-fatal when disk is unavailable (serverless).
    }
    return fromSb;
  }

  if (isSupabaseConfigured() && !process.env.TC_DB_WRITE_KEY?.trim()) {
    throw new Error(
      "Cannot save package prices to live data: TC_DB_WRITE_KEY is missing.",
    );
  }

  const store = await getStore();
  ensurePackages(store);
  const previousSlug = options?.previousSlug || next.slug;
  const existingIndex = store.packages.findIndex((p) => p.slug === previousSlug);
  const slugTaken = store.packages.some(
    (p, i) => p.slug === next.slug && i !== existingIndex,
  );
  if (slugTaken) {
    throw new Error("A package with that URL slug already exists.");
  }

  if (existingIndex >= 0) {
    store.packages[existingIndex] = next;
  } else {
    store.packages.push(next);
  }

  await saveStore(store);
  return next;
}

export async function deletePackage(slug: string) {
  const fromSb = await sbDeletePackage(slug);
  if (fromSb !== null) {
    if (globalThis.__tcAdminStore) {
      globalThis.__tcAdminStore.packages =
        globalThis.__tcAdminStore.packages.filter((p) => p.slug !== slug);
    }
    return fromSb;
  }
  const store = await getStore();
  ensurePackages(store);
  const before = store.packages.length;
  store.packages = store.packages.filter((p) => p.slug !== slug);
  if (store.packages.length === before) return false;
  await saveStore(store);
  return true;
}

export async function getSitePopup() {
  const fromSb = await sbGetPopup();
  if (fromSb) return fromSb;
  const store = await getStore();
  ensurePopup(store);
  return store.popup;
}

export async function updateSitePopup(
  input: Partial<Omit<SitePopup, "updatedAt">> & { clearImage?: boolean },
) {
  const store = await getStore();
  ensurePopup(store);
  const { clearImage, ...fields } = input;
  const next: SitePopup = {
    ...store.popup,
    ...fields,
    active: fields.active ?? store.popup.active,
    title: (fields.title ?? store.popup.title).trim(),
    message: (fields.message ?? store.popup.message).trim(),
    ctaLabel: (fields.ctaLabel ?? store.popup.ctaLabel ?? "").trim(),
    ctaHref: (fields.ctaHref ?? store.popup.ctaHref ?? "").trim(),
    updatedAt: new Date().toISOString(),
  };
  if (clearImage) {
    next.imageUrl = null;
  } else if (fields.imageUrl !== undefined) {
    next.imageUrl = fields.imageUrl;
  } else {
    next.imageUrl = store.popup.imageUrl || null;
  }

  const fromSb = await sbUpdatePopup(next);
  store.popup = fromSb || next;
  await saveStore(store);
  return store.popup;
}

export async function saveStore(store: AdminStore) {
  globalThis.__tcAdminStore = store;
  await writeToDisk(store);
}

export function packageAmount(slug: string, catalog?: CareerPackage[]) {
  const list = catalog || defaultPackages;
  return list.find((p) => p.slug === slug)?.quoteAmount ?? 1500;
}

export async function addCheckoutOrder(input: {
  firstName: string;
  surname: string;
  email: string;
  whatsapp: string;
  location: string;
  country: string;
  packageSlug: string;
  cvColor?: string | null;
  cvUrl?: string | null;
  pictureUrl?: string | null;
}) {
  const store = await getStore();
  ensurePackages(store);
  const pkg =
    (await sbGetPackage(input.packageSlug, true)) ||
    store.packages.find((p) => p.slug === input.packageSlug);
  const isInvoice = input.packageSlug === "invoice-request";
  const id = `ord_${Date.now()}`;
  const fallbackNumber = `TC-${String(Date.now()).slice(-5)}`;
  const order: AdminOrder = {
    id,
    orderNumber: fallbackNumber,
    createdAt: new Date().toISOString(),
    firstName: input.firstName,
    surname: input.surname,
    email: input.email,
    whatsapp: input.whatsapp,
    location: input.location,
    country: input.country,
    packageSlug: input.packageSlug,
    packageName: isInvoice
      ? "Invoice request"
      : pkg?.name || input.packageSlug,
    cvColor: input.cvColor,
    cvUrl: input.cvUrl,
    pictureUrl: input.pictureUrl,
    amount: isInvoice
      ? 0
      : packageAmount(
          input.packageSlug,
          pkg ? [pkg, ...store.packages] : store.packages,
        ),
    status: "pending",
    assignedWriter: store.writers[0]?.name || null,
  };

  const savedToSb = await sbAddCheckoutOrder(order, {
    name: `${input.firstName} ${input.surname}`,
    email: input.email,
    whatsapp: input.whatsapp,
    country: input.country,
  });

  if (savedToSb) {
    order.id = savedToSb.id;
    order.orderNumber = savedToSb.orderNumber;
  } else if (isSupabaseConfigured()) {
    throw new Error(
      "Could not save this order to the database. Please try again or WhatsApp us.",
    );
  }

  store.orders.unshift(order);

  const existing = store.customers.find(
    (c) => c.email.toLowerCase() === input.email.toLowerCase(),
  );
  if (existing) {
    existing.orders += 1;
  } else {
    store.customers.unshift({
      id: `cus_${Date.now()}`,
      name: `${input.firstName} ${input.surname}`,
      email: input.email,
      whatsapp: input.whatsapp,
      country: input.country,
      orders: 1,
      createdAt: order.createdAt,
    });
  }

  store.notifications = store.orders.filter((o) => o.status === "pending").length;
  if (!savedToSb) await saveStore(store);
  else {
    globalThis.__tcAdminStore = store;
  }
  return order;
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const fromSb = await sbUpdateOrderStatus(id, status);
  if (fromSb) {
    if (globalThis.__tcAdminStore) {
      const idx = globalThis.__tcAdminStore.orders.findIndex((o) => o.id === id);
      if (idx >= 0) globalThis.__tcAdminStore.orders[idx] = fromSb;
      globalThis.__tcAdminStore.notifications = getAccurateNotificationCount(
        globalThis.__tcAdminStore,
      );
    }
    return fromSb;
  }

  const store = await getStore();
  const order = store.orders.find((o) => o.id === id);
  if (!order) return null;
  order.status = status;
  if (status === "completed") {
    order.completedAt = new Date().toISOString();
  } else {
    order.completedAt = null;
  }
  store.notifications = store.orders.filter((o) => o.status === "pending").length;
  await saveStore(store);
  return order;
}

function isCompletedRevenue(order: AdminOrder) {
  return order.status === "completed";
}

function revenueDate(order: AdminOrder) {
  return new Date(order.completedAt || order.createdAt);
}

export function getDashboardStats(store: AdminStore) {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday start
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const completed = store.orders.filter(isCompletedRevenue);

  const sumSince = (from: Date) =>
    completed
      .filter((o) => revenueDate(o) >= from)
      .reduce((acc, o) => acc + o.amount, 0);

  const pendingOrders = store.orders.filter((o) => o.status === "pending").length;

  return {
    today: sumSince(startOfDay),
    week: sumSince(startOfWeek),
    month: sumSince(startOfMonth),
    allTime: completed.reduce((acc, o) => acc + o.amount, 0),
    totalOrders: store.orders.length,
    pendingOrders,
    completedOrders: completed.length,
    totalCustomers: store.customers.length,
    pipelineQuoted: store.orders
      .filter((o) => o.status === "pending" || o.status === "in_progress")
      .reduce((acc, o) => acc + o.amount, 0),
  };
}

export function getWriterPerformance(store: AdminStore): AdminWriter[] {
  return store.writers.map((writer) => {
    const assigned = store.orders.filter(
      (o) => o.assignedWriter === writer.name,
    );
    const activeOrders = assigned.filter(
      (o) => o.status === "pending" || o.status === "in_progress",
    ).length;
    const completedOrders = assigned.filter((o) => o.status === "completed");
    const totalRevenue = completedOrders.reduce((acc, o) => acc + o.amount, 0);

    const turnarounds = completedOrders
      .map((o) => {
        if (!o.completedAt) return null;
        const ms =
          new Date(o.completedAt).getTime() - new Date(o.createdAt).getTime();
        return ms / (1000 * 60 * 60 * 24);
      })
      .filter((n): n is number => typeof n === "number" && Number.isFinite(n));

    const avgTurnaroundDays =
      turnarounds.length > 0
        ? Math.round(
            (turnarounds.reduce((a, b) => a + b, 0) / turnarounds.length) * 10,
          ) / 10
        : 0;

    return {
      ...writer,
      activeOrders,
      completed: completedOrders.length,
      avgTurnaroundDays,
      totalRevenue,
    };
  });
}

export function getAccurateNotificationCount(store: AdminStore) {
  return store.orders.filter((o) => o.status === "pending").length;
}
