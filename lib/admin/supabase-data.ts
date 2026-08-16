import type { CareerPackage, CvColorOption } from "@/lib/packages";
import {
  createAdminClient,
  createAnonClient,
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import type {
  AdminCustomer,
  AdminOrder,
  AdminWriter,
  OrderStatus,
  SitePopup,
} from "@/lib/admin/store";

type PackageRow = {
  slug: string;
  name: string;
  subtitle: string | null;
  tagline: string;
  summary: string;
  price_label: string;
  includes: unknown;
  ideal_for: string;
  timeline: string;
  region: string | null;
  color_options: unknown;
  sample_image: string | null;
  quote_amount: number | string;
  active: boolean;
  sort_order: number;
};

type OrderRow = {
  id: string;
  order_number: string | null;
  created_at: string;
  completed_at: string | null;
  first_name: string;
  surname: string;
  email: string;
  whatsapp: string;
  location: string;
  country: string;
  package_slug: string;
  package_name: string;
  cv_color: string | null;
  cv_url: string | null;
  picture_url: string | null;
  amount: number | string;
  status: OrderStatus;
  assigned_writer: string | null;
};

type WriterRow = {
  id: string;
  name: string;
  email: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  country: string;
  orders: number;
  created_at: string;
};

export type InterviewSessionRow = {
  id: string;
  first_name: string;
  surname: string;
  position: string;
  phone: string;
  email: string;
  interviewer: "lisa" | "clemence" | null;
  duration_minutes: 15 | 30 | 60 | null;
  status: "registered" | "in_progress" | "completed";
  created_at: string;
  completed_at?: string | null;
  transcript?: unknown;
  results?: unknown;
  overall_score?: number | null;
  audio_clips?: unknown;
};

export type AdminInterviewSession = {
  id: string;
  firstName: string;
  surname: string;
  position: string;
  phone: string;
  email: string;
  interviewer: "lisa" | "clemence" | null;
  durationMinutes: 15 | 30 | 60 | null;
  status: "registered" | "in_progress" | "completed";
  createdAt: string;
  completedAt?: string | null;
  overallScore?: number | null;
  transcript: { id: string; role: string; content: string }[];
  results: {
    overallScore: number;
    summary: string;
    strengths: string[];
    improvements: string[];
    corrections: {
      question: string;
      candidateAnswer: string;
      whatWorked: string;
      betterAnswer: string;
    }[];
    closingAdvice: string;
  } | null;
  audioClips: { id: string; role: string; url: string; text?: string }[];
};

function asTranscript(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      if (
        typeof row.id !== "string" ||
        typeof row.role !== "string" ||
        typeof row.content !== "string"
      ) {
        return null;
      }
      return { id: row.id, role: row.role, content: row.content };
    })
    .filter((v): v is { id: string; role: string; content: string } =>
      Boolean(v),
    );
}

function asAudioClips(
  value: unknown,
): { id: string; role: string; url: string; text?: string }[] {
  if (!Array.isArray(value)) return [];
  const out: { id: string; role: string; url: string; text?: string }[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (
      typeof row.id !== "string" ||
      typeof row.role !== "string" ||
      typeof row.url !== "string"
    ) {
      continue;
    }
    const clip: { id: string; role: string; url: string; text?: string } = {
      id: row.id,
      role: row.role,
      url: row.url,
    };
    if (typeof row.text === "string") clip.text = row.text;
    out.push(clip);
  }
  return out;
}

function asResults(value: unknown): AdminInterviewSession["results"] {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.overallScore !== "number" ||
    typeof row.summary !== "string" ||
    !Array.isArray(row.strengths) ||
    !Array.isArray(row.improvements) ||
    !Array.isArray(row.corrections)
  ) {
    return null;
  }
  return {
    overallScore: row.overallScore,
    summary: row.summary,
    strengths: row.strengths.filter((s): s is string => typeof s === "string"),
    improvements: row.improvements.filter(
      (s): s is string => typeof s === "string",
    ),
    corrections: row.corrections
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const c = item as Record<string, unknown>;
        if (
          typeof c.question !== "string" ||
          typeof c.candidateAnswer !== "string" ||
          typeof c.whatWorked !== "string" ||
          typeof c.betterAnswer !== "string"
        ) {
          return null;
        }
        return {
          question: c.question,
          candidateAnswer: c.candidateAnswer,
          whatWorked: c.whatWorked,
          betterAnswer: c.betterAnswer,
        };
      })
      .filter(
        (
          v,
        ): v is {
          question: string;
          candidateAnswer: string;
          whatWorked: string;
          betterAnswer: string;
        } => Boolean(v),
      ),
    closingAdvice:
      typeof row.closingAdvice === "string"
        ? row.closingAdvice
        : "Keep practising.",
  };
}

export function mapInterviewSessionRow(
  row: InterviewSessionRow,
): AdminInterviewSession {
  return {
    id: row.id,
    firstName: row.first_name,
    surname: row.surname,
    position: row.position,
    phone: row.phone,
    email: row.email,
    interviewer: row.interviewer,
    durationMinutes: row.duration_minutes,
    status: row.status,
    createdAt: row.created_at,
    completedAt: row.completed_at || null,
    overallScore: row.overall_score ?? null,
    transcript: asTranscript(row.transcript),
    results: asResults(row.results),
    audioClips: asAudioClips(row.audio_clips),
  };
}

export function mapWriterRow(row: WriterRow): AdminWriter {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    activeOrders: 0,
    completed: 0,
    avgTurnaroundDays: 0,
    totalRevenue: 0,
  };
}

type PopupRow = {
  active: boolean;
  title: string;
  message: string;
  image_url: string | null;
  cta_label: string | null;
  cta_href: string | null;
  updated_at: string;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

function asColorOptions(value: unknown): CvColorOption[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      if (
        typeof row.id !== "string" ||
        typeof row.label !== "string" ||
        typeof row.hex !== "string"
      ) {
        return null;
      }
      return { id: row.id, label: row.label, hex: row.hex };
    })
    .filter((v): v is CvColorOption => Boolean(v));
}

export function mapPackageRow(row: PackageRow): CareerPackage {
  return {
    slug: row.slug,
    name: row.name,
    subtitle: row.subtitle || undefined,
    tagline: row.tagline,
    summary: row.summary,
    priceLabel: row.price_label,
    includes: asStringArray(row.includes),
    idealFor: row.ideal_for,
    timeline: row.timeline,
    region: row.region || undefined,
    colorOptions: asColorOptions(row.color_options),
    sampleImage: row.sample_image || undefined,
    quoteAmount: Number(row.quote_amount) || 1500,
    active: row.active !== false,
  };
}

function toPackageRow(pkg: CareerPackage, sortOrder = 0): Record<string, unknown> {
  return {
    slug: pkg.slug,
    name: pkg.name,
    subtitle: pkg.subtitle || null,
    tagline: pkg.tagline,
    summary: pkg.summary,
    price_label: pkg.priceLabel,
    includes: pkg.includes,
    ideal_for: pkg.idealFor,
    timeline: pkg.timeline,
    region: pkg.region || null,
    color_options: pkg.colorOptions || null,
    sample_image: pkg.sampleImage || null,
    quote_amount: pkg.quoteAmount,
    active: pkg.active !== false,
    sort_order: sortOrder,
    updated_at: new Date().toISOString(),
  };
}

export function mapOrderRow(row: OrderRow): AdminOrder {
  return {
    id: row.id,
    orderNumber: row.order_number || row.id,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    firstName: row.first_name,
    surname: row.surname,
    email: row.email,
    whatsapp: row.whatsapp,
    location: row.location,
    country: row.country,
    packageSlug: row.package_slug,
    packageName: row.package_name,
    cvColor: row.cv_color,
    cvUrl: row.cv_url,
    pictureUrl: row.picture_url,
    amount: Number(row.amount) || 0,
    status: row.status,
    assignedWriter: row.assigned_writer,
  };
}

export function mapCustomerRow(row: CustomerRow): AdminCustomer {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    whatsapp: row.whatsapp,
    country: row.country,
    orders: row.orders,
    createdAt: row.created_at,
  };
}

export function mapPopupRow(row: PopupRow): SitePopup {
  return {
    active: Boolean(row.active),
    title: row.title,
    message: row.message,
    imageUrl: row.image_url,
    ctaLabel: row.cta_label || "",
    ctaHref: row.cta_href || "",
    updatedAt: row.updated_at,
  };
}

export async function sbListPackages(includeInactive = false) {
  if (!isSupabaseConfigured()) return null;
  const client = isSupabaseAdminConfigured()
    ? createAdminClient()
    : createAnonClient();
  let query = client
    .from("tc_packages")
    .select("*")
    .order("sort_order", { ascending: true });
  if (!includeInactive) query = query.eq("active", true);
  const { data, error } = await query;
  if (error) {
    console.warn("[supabase] list packages failed", error.message);
    return null;
  }
  return (data as PackageRow[]).map(mapPackageRow);
}

export async function sbGetPackage(slug: string, includeInactive = false) {
  if (!isSupabaseConfigured()) return null;
  const client = isSupabaseAdminConfigured()
    ? createAdminClient()
    : createAnonClient();
  const { data, error } = await client
    .from("tc_packages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.warn("[supabase] get package failed", error.message);
    return null;
  }
  if (!data) return undefined;
  const pkg = mapPackageRow(data as PackageRow);
  if (!includeInactive && pkg.active === false) return undefined;
  return pkg;
}

export async function sbUpsertPackage(
  pkg: CareerPackage,
  previousSlug?: string,
) {
  const writeKey = process.env.TC_DB_WRITE_KEY?.trim();
  const oldSlug = previousSlug || pkg.slug;
  const row = toPackageRow(pkg);

  if (isSupabaseAdminConfigured()) {
    const client = createAdminClient();

    if (oldSlug !== pkg.slug) {
      // Rename in place so order FKs cascade instead of delete+reinsert.
      const { error: renameError } = await client
        .from("tc_packages")
        .update({ slug: pkg.slug })
        .eq("slug", oldSlug);
      if (renameError) throw new Error(renameError.message);
    }

    const { data: existing } = await client
      .from("tc_packages")
      .select("sort_order")
      .eq("slug", pkg.slug)
      .maybeSingle();

    const { count } = await client
      .from("tc_packages")
      .select("*", { count: "exact", head: true });

    const upsertRow = {
      ...row,
      sort_order:
        typeof existing?.sort_order === "number"
          ? existing.sort_order
          : (count || 0) + 1,
    };

    const { data, error } = await client
      .from("tc_packages")
      .upsert(upsertRow)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapPackageRow(data as PackageRow);
  }

  // Anon RPC path when service role is not configured (production admin writes).
  if (!isSupabaseConfigured() || !writeKey) return null;
  const client = createAnonClient();

  if (oldSlug !== pkg.slug) {
    const { data, error } = await client.rpc("tc_upsert_package", {
      payload: row,
      write_key: writeKey,
    });
    if (error) throw new Error(error.message);
    const { error: delError } = await client.rpc("tc_delete_package", {
      p_slug: oldSlug,
      write_key: writeKey,
    });
    if (delError) {
      console.warn(
        "[supabase] old package slug delete skipped",
        delError.message,
      );
    }
    return mapPackageRow(data as PackageRow);
  }

  const { data, error } = await client.rpc("tc_upsert_package", {
    payload: row,
    write_key: writeKey,
  });
  if (error) throw new Error(error.message);
  return mapPackageRow(data as PackageRow);
}

export async function sbDeletePackage(slug: string) {
  const writeKey = process.env.TC_DB_WRITE_KEY?.trim();

  if (isSupabaseAdminConfigured()) {
    const client = createAdminClient();
    const { error, count } = await client
      .from("tc_packages")
      .delete({ count: "exact" })
      .eq("slug", slug);
    if (error) throw new Error(error.message);
    return (count || 0) > 0;
  }

  if (!isSupabaseConfigured() || !writeKey) return null;
  const client = createAnonClient();
  const { data, error } = await client.rpc("tc_delete_package", {
    p_slug: slug,
    write_key: writeKey,
  });
  if (error) throw new Error(error.message);
  return Boolean(data);
}

export async function sbGetPopup() {
  if (!isSupabaseConfigured()) return null;
  const client = createAnonClient();
  const { data, error } = await client
    .from("tc_site_popup")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) {
    console.warn("[supabase] get popup failed", error.message);
    return null;
  }
  if (!data) return null;
  return mapPopupRow(data as PopupRow);
}

export async function sbUpdatePopup(popup: SitePopup) {
  if (!isSupabaseAdminConfigured()) return null;
  const client = createAdminClient();
  const { data, error } = await client
    .from("tc_site_popup")
    .upsert({
      id: 1,
      active: popup.active,
      title: popup.title,
      message: popup.message,
      image_url: popup.imageUrl || null,
      cta_label: popup.ctaLabel || "",
      cta_href: popup.ctaHref || "",
      updated_at: popup.updatedAt,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapPopupRow(data as PopupRow);
}

export async function sbListOrders() {
  if (isSupabaseAdminConfigured()) {
    const client = createAdminClient();
    const { data, error } = await client
      .from("tc_orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.warn("[supabase] list orders failed", error.message);
      return null;
    }
    return (data as OrderRow[]).map(mapOrderRow);
  }

  const writeKey = process.env.TC_DB_WRITE_KEY?.trim();
  if (!isSupabaseConfigured() || !writeKey) return null;
  const client = createAnonClient();
  const { data, error } = await client.rpc("tc_list_orders", {
    write_key: writeKey,
  });
  if (error) {
    console.warn("[supabase] list orders rpc failed", error.message);
    return null;
  }
  return (data as OrderRow[]).map(mapOrderRow);
}

/** Fetch one order by UUID/id or human order number (e.g. TC-01006). */
export async function sbGetOrder(orderRef: string) {
  const ref = orderRef.trim();
  if (!ref) return null;

  if (isSupabaseAdminConfigured()) {
    const client = createAdminClient();
    const { data, error } = await client
      .from("tc_orders")
      .select("*")
      .or(`id.eq.${ref},order_number.eq.${ref}`)
      .maybeSingle();
    if (error) {
      console.warn("[supabase] get order failed", error.message);
      return null;
    }
    return data ? mapOrderRow(data as OrderRow) : null;
  }

  const writeKey = process.env.TC_DB_WRITE_KEY?.trim();
  if (!isSupabaseConfigured() || !writeKey) return null;
  const client = createAnonClient();
  const { data, error } = await client.rpc("tc_get_order", {
    order_ref: ref,
    write_key: writeKey,
  });
  if (error) {
    console.warn("[supabase] get order rpc failed", error.message);
    // Fallback: list and match (older DBs without tc_get_order).
    const listed = await sbListOrders();
    return (
      listed?.find((o) => o.id === ref || o.orderNumber === ref) || null
    );
  }
  const rows = data as OrderRow[] | OrderRow | null;
  const row = Array.isArray(rows) ? rows[0] : rows;
  return row ? mapOrderRow(row) : null;
}

export async function sbListCustomers() {
  if (isSupabaseAdminConfigured()) {
    const client = createAdminClient();
    const { data, error } = await client
      .from("tc_customers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.warn("[supabase] list customers failed", error.message);
      return null;
    }
    return (data as CustomerRow[]).map(mapCustomerRow);
  }

  const writeKey = process.env.TC_DB_WRITE_KEY?.trim();
  if (!isSupabaseConfigured() || !writeKey) return null;
  const client = createAnonClient();
  const { data, error } = await client.rpc("tc_list_customers", {
    write_key: writeKey,
  });
  if (error) {
    console.warn("[supabase] list customers rpc failed", error.message);
    return null;
  }
  return (data as CustomerRow[]).map(mapCustomerRow);
}

export async function sbAddCheckoutOrder(order: AdminOrder, customer: {
  name: string;
  email: string;
  whatsapp: string;
  country: string;
}): Promise<{ id: string; orderNumber: string } | null> {
  const writeKey = process.env.TC_DB_WRITE_KEY?.trim();

  if (isSupabaseAdminConfigured()) {
    const client = createAdminClient();
    // Leave order_number null so the DB trigger assigns TC-xxxxx from the sequence.
    const { data: inserted, error: orderError } = await client
      .from("tc_orders")
      .insert({
        id: order.id,
        order_number: null,
        created_at: order.createdAt,
        completed_at: order.completedAt || null,
        first_name: order.firstName,
        surname: order.surname,
        email: order.email,
        whatsapp: order.whatsapp,
        location: order.location,
        country: order.country,
        package_slug: order.packageSlug,
        package_name: order.packageName,
        cv_color: order.cvColor || null,
        cv_url: order.cvUrl || null,
        picture_url: order.pictureUrl || null,
        amount: order.amount,
        status: order.status,
        assigned_writer: order.assignedWriter || null,
      })
      .select("id, order_number")
      .single();
    if (orderError || !inserted) {
      console.warn(
        "[supabase] insert order failed",
        orderError?.message || "no row returned",
      );
      return null;
    }

    const { data: existing } = await client
      .from("tc_customers")
      .select("*")
      .ilike("email", customer.email)
      .maybeSingle();

    if (existing) {
      await client
        .from("tc_customers")
        .update({ orders: (existing.orders || 0) + 1 })
        .eq("id", existing.id);
    } else {
      await client.from("tc_customers").insert({
        id: `cus_${Date.now()}`,
        name: customer.name,
        email: customer.email,
        whatsapp: customer.whatsapp,
        country: customer.country,
        orders: 1,
        created_at: order.createdAt,
      });
    }

    return {
      id: inserted.id as string,
      orderNumber: (inserted.order_number as string) || order.orderNumber,
    };
  }

  if (!isSupabaseConfigured() || !writeKey) return null;

  const client = createAnonClient();
  const { data, error } = await client.rpc("tc_create_checkout_order", {
    payload: {
      id: order.id,
      created_at: order.createdAt,
      first_name: order.firstName,
      surname: order.surname,
      email: order.email,
      whatsapp: order.whatsapp,
      location: order.location,
      country: order.country,
      package_slug: order.packageSlug,
      package_name: order.packageName,
      cv_color: order.cvColor || null,
      cv_url: order.cvUrl || null,
      picture_url: order.pictureUrl || null,
      amount: order.amount,
      status: order.status,
      assigned_writer: order.assignedWriter || null,
      customer_name: customer.name,
    },
    write_key: writeKey,
  });

  if (error) {
    console.warn("[supabase] create order rpc failed", error.message);
    return null;
  }

  const result = data as { id?: string; order_number?: string } | null;
  if (!result?.id || !result.order_number) return null;
  return { id: result.id, orderNumber: result.order_number };
}

export async function sbUpdateOrder(
  id: string,
  patch: {
    status?: OrderStatus;
    assignedWriter?: string | null;
    cvUrl?: string | null;
    pictureUrl?: string | null;
  },
) {
  const setWriter = Object.prototype.hasOwnProperty.call(patch, "assignedWriter");
  const setCv = Object.prototype.hasOwnProperty.call(patch, "cvUrl");
  const setPicture = Object.prototype.hasOwnProperty.call(patch, "pictureUrl");

  if (isSupabaseAdminConfigured()) {
    const client = createAdminClient();
    const update: Record<string, unknown> = {};
    if (patch.status) {
      update.status = patch.status;
      update.completed_at =
        patch.status === "completed" ? new Date().toISOString() : null;
    }
    if (setWriter) {
      update.assigned_writer = patch.assignedWriter || null;
    }
    if (setCv) {
      update.cv_url = patch.cvUrl || null;
    }
    if (setPicture) {
      update.picture_url = patch.pictureUrl || null;
    }
    if (Object.keys(update).length === 0) return undefined;
    const { data, error } = await client
      .from("tc_orders")
      .update(update)
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return undefined;
    return mapOrderRow(data as OrderRow);
  }

  const writeKey = process.env.TC_DB_WRITE_KEY?.trim();
  if (!isSupabaseConfigured() || !writeKey) return null;
  const client = createAnonClient();
  const { data, error } = await client.rpc("tc_update_order", {
    p_id: id,
    write_key: writeKey,
    p_status: patch.status || null,
    p_assigned_writer: setWriter ? patch.assignedWriter || "" : null,
    p_set_writer: setWriter,
    p_cv_url: setCv ? patch.cvUrl || "" : null,
    p_set_cv: setCv,
    p_picture_url: setPicture ? patch.pictureUrl || "" : null,
    p_set_picture: setPicture,
  });
  if (error) throw new Error(error.message);
  if (!data) return undefined;
  return mapOrderRow(data as OrderRow);
}

export async function sbUpdateOrderStatus(id: string, status: OrderStatus) {
  return sbUpdateOrder(id, { status });
}

export async function sbListWriters() {
  if (isSupabaseAdminConfigured()) {
    const client = createAdminClient();
    const { data, error } = await client
      .from("tc_writers")
      .select("*")
      .order("name", { ascending: true });
    if (error) {
      console.warn("[supabase] list writers failed", error.message);
      return null;
    }
    return (data as WriterRow[]).map(mapWriterRow);
  }

  const writeKey = process.env.TC_DB_WRITE_KEY?.trim();
  if (!isSupabaseConfigured() || !writeKey) return null;
  const client = createAnonClient();
  const { data, error } = await client.rpc("tc_list_writers", {
    write_key: writeKey,
  });
  if (error) {
    console.warn("[supabase] list writers rpc failed", error.message);
    return null;
  }
  return (data as WriterRow[]).map(mapWriterRow);
}

export async function sbUpsertWriter(writer: {
  id?: string;
  name: string;
  email: string;
}) {
  const payload = {
    id: writer.id || `w_${Date.now()}`,
    name: writer.name.trim(),
    email: writer.email.trim().toLowerCase(),
    active: true,
  };

  if (isSupabaseAdminConfigured()) {
    const client = createAdminClient();
    const { data, error } = await client
      .from("tc_writers")
      .upsert({
        id: payload.id,
        name: payload.name,
        email: payload.email,
        active: true,
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapWriterRow(data as WriterRow);
  }

  const writeKey = process.env.TC_DB_WRITE_KEY?.trim();
  if (!isSupabaseConfigured() || !writeKey) return null;
  const client = createAnonClient();
  const { data, error } = await client.rpc("tc_upsert_writer", {
    payload,
    write_key: writeKey,
  });
  if (error) throw new Error(error.message);
  return mapWriterRow(data as WriterRow);
}

export async function sbDeleteWriter(id: string) {
  if (isSupabaseAdminConfigured()) {
    const client = createAdminClient();
    const { error, count } = await client
      .from("tc_writers")
      .delete({ count: "exact" })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return (count || 0) > 0;
  }

  const writeKey = process.env.TC_DB_WRITE_KEY?.trim();
  if (!isSupabaseConfigured() || !writeKey) return null;
  const client = createAnonClient();
  const { data, error } = await client.rpc("tc_delete_writer", {
    p_id: id,
    write_key: writeKey,
  });
  if (error) throw new Error(error.message);
  return Boolean(data);
}

export async function sbRegisterInterviewSession(payload: {
  firstName: string;
  surname: string;
  position: string;
  phone: string;
  email: string;
}) {
  if (isSupabaseAdminConfigured()) {
    const client = createAdminClient();
    const { data, error } = await client
      .from("tc_interview_sessions")
      .insert({
        first_name: payload.firstName.trim(),
        surname: payload.surname.trim(),
        position: payload.position.trim(),
        phone: payload.phone.trim(),
        email: payload.email.trim().toLowerCase(),
        status: "registered",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: data.id as string };
  }

  const writeKey = process.env.TC_DB_WRITE_KEY?.trim();
  if (!isSupabaseConfigured() || !writeKey) return null;
  const client = createAnonClient();
  const { data, error } = await client.rpc("tc_register_interview_session", {
    payload: {
      first_name: payload.firstName.trim(),
      surname: payload.surname.trim(),
      position: payload.position.trim(),
      phone: payload.phone.trim(),
      email: payload.email.trim().toLowerCase(),
      status: "registered",
    },
    write_key: writeKey,
  });
  if (error) {
    console.warn("[supabase] register interview session failed", error.message);
    return null;
  }
  const result = data as { id?: string } | null;
  if (!result?.id) return null;
  return { id: result.id };
}

export async function sbUpdateInterviewSession(
  id: string,
  patch: {
    status?: "registered" | "in_progress" | "completed";
    interviewer?: "lisa" | "clemence" | null;
    durationMinutes?: 15 | 30 | 60 | null;
  },
) {
  if (isSupabaseAdminConfigured()) {
    const client = createAdminClient();
    const update: Record<string, unknown> = {};
    if (patch.status) update.status = patch.status;
    if (Object.prototype.hasOwnProperty.call(patch, "interviewer")) {
      update.interviewer = patch.interviewer;
    }
    if (Object.prototype.hasOwnProperty.call(patch, "durationMinutes")) {
      update.duration_minutes = patch.durationMinutes;
    }
    if (Object.keys(update).length === 0) return undefined;
    const { data, error } = await client
      .from("tc_interview_sessions")
      .update(update)
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return undefined;
    return mapInterviewSessionRow(data as InterviewSessionRow);
  }

  const writeKey = process.env.TC_DB_WRITE_KEY?.trim();
  if (!isSupabaseConfigured() || !writeKey) return null;
  const client = createAnonClient();
  const { data, error } = await client.rpc("tc_update_interview_session", {
    p_id: id,
    write_key: writeKey,
    p_status: patch.status || null,
    p_interviewer: patch.interviewer || null,
    p_duration_minutes: patch.durationMinutes ?? null,
  });
  if (error) throw new Error(error.message);
  if (!data) return undefined;
  return mapInterviewSessionRow(data as InterviewSessionRow);
}

export async function sbCompleteInterviewSession(
  id: string,
  payload: {
    transcript: unknown;
    results: unknown;
    overallScore: number;
    audioClips: unknown;
  },
) {
  if (isSupabaseAdminConfigured()) {
    const client = createAdminClient();
    const { data, error } = await client
      .from("tc_interview_sessions")
      .update({
        status: "completed",
        transcript: payload.transcript,
        results: payload.results,
        overall_score: payload.overallScore,
        audio_clips: payload.audioClips,
        completed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return undefined;
    return mapInterviewSessionRow(data as InterviewSessionRow);
  }

  const writeKey = process.env.TC_DB_WRITE_KEY?.trim();
  if (!isSupabaseConfigured() || !writeKey) return null;
  const client = createAnonClient();
  const { data, error } = await client.rpc("tc_complete_interview_session", {
    p_id: id,
    write_key: writeKey,
    p_transcript: payload.transcript,
    p_results: payload.results,
    p_overall_score: payload.overallScore,
    p_audio_clips: payload.audioClips,
  });
  if (error) throw new Error(error.message);
  if (!data) return undefined;
  return mapInterviewSessionRow(data as InterviewSessionRow);
}

export async function sbGetInterviewSession(id: string) {
  if (isSupabaseAdminConfigured()) {
    const client = createAdminClient();
    const { data, error } = await client
      .from("tc_interview_sessions")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return mapInterviewSessionRow(data as InterviewSessionRow);
  }

  const writeKey = process.env.TC_DB_WRITE_KEY?.trim();
  if (!isSupabaseConfigured() || !writeKey) return null;
  const client = createAnonClient();
  const { data, error } = await client.rpc("tc_get_interview_session", {
    p_id: id,
    write_key: writeKey,
  });
  if (error) {
    console.warn("[supabase] get interview session failed", error.message);
    return null;
  }
  if (!data) return null;
  return mapInterviewSessionRow(data as InterviewSessionRow);
}

export async function sbListInterviewSessions() {
  if (isSupabaseAdminConfigured()) {
    const client = createAdminClient();
    const { data, error } = await client
      .from("tc_interview_sessions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.warn("[supabase] list interview sessions failed", error.message);
      return null;
    }
    return (data as InterviewSessionRow[]).map(mapInterviewSessionRow);
  }

  const writeKey = process.env.TC_DB_WRITE_KEY?.trim();
  if (!isSupabaseConfigured() || !writeKey) return null;
  const client = createAnonClient();
  const { data, error } = await client.rpc("tc_list_interview_sessions", {
    write_key: writeKey,
  });
  if (error) {
    console.warn(
      "[supabase] list interview sessions rpc failed",
      error.message,
    );
    return null;
  }
  return (data as InterviewSessionRow[]).map(mapInterviewSessionRow);
}
