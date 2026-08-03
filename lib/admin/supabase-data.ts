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

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  country: string;
  orders: number;
  created_at: string;
};

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
  let query = client.from("tc_packages").select("*").eq("slug", slug).maybeSingle();
  const { data, error } = await query;
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
      const { error: delError } = await client
        .from("tc_packages")
        .delete()
        .eq("slug", oldSlug);
      if (delError) throw new Error(delError.message);
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
    const { error: delError } = await client.rpc("tc_delete_package", {
      p_slug: oldSlug,
      write_key: writeKey,
    });
    if (delError) throw new Error(delError.message);
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
  if (!isSupabaseAdminConfigured()) return null;
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

export async function sbListCustomers() {
  if (!isSupabaseAdminConfigured()) return null;
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

export async function sbUpdateOrderStatus(id: string, status: OrderStatus) {
  if (!isSupabaseAdminConfigured()) return null;
  const client = createAdminClient();
  const patch: Record<string, unknown> = { status };
  if (status === "completed") {
    patch.completed_at = new Date().toISOString();
  } else {
    patch.completed_at = null;
  }
  const { data, error } = await client
    .from("tc_orders")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return undefined;
  return mapOrderRow(data as OrderRow);
}
