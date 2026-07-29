import { promises as fs } from "fs";
import path from "path";
import {
  createAdminClient,
  createAnonClient,
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import {
  hashPassword,
  localRecruiterId,
  verifyPassword,
} from "@/lib/recruiter/session";

export type JobStatus = "pending" | "published" | "rejected" | "closed";
export type EmploymentType = "full-time" | "part-time" | "contract" | "remote";
export type VerificationStatus = "pending" | "approved" | "rejected";

export type Recruiter = {
  id: string;
  name: string;
  email: string;
  company: string;
  whatsapp: string | null;
  logoUrl: string | null;
  verificationStatus: VerificationStatus;
  verifiedAt: string | null;
  verificationNote: string | null;
  active: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

export type JobPost = {
  id: string;
  recruiterId: string;
  title: string;
  companyName: string;
  location: string;
  employmentType: EmploymentType;
  description: string;
  requirements: string;
  salaryLabel: string | null;
  contactEmail: string | null;
  companyLogoUrl: string | null;
  status: JobStatus;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  recruiterEmail?: string;
  recruiterName?: string;
};

type RecruiterRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  company: string;
  whatsapp: string | null;
  logo_url: string | null;
  verification_status: VerificationStatus;
  verified_at: string | null;
  verification_note: string | null;
  active: boolean;
  created_at: string;
  last_login_at: string | null;
};

type JobRow = {
  id: string;
  recruiter_id: string;
  title: string;
  company_name: string;
  location: string;
  employment_type: EmploymentType;
  description: string;
  requirements: string;
  salary_label: string | null;
  contact_email: string | null;
  company_logo_url: string | null;
  status: JobStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

type LocalStore = {
  recruiters: RecruiterRow[];
  jobs: JobRow[];
};

const STORE_PATH = path.join(process.cwd(), "data", "recruiter-store.json");

function mapRecruiter(row: RecruiterRow): Recruiter {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    company: row.company,
    whatsapp: row.whatsapp,
    logoUrl: row.logo_url ?? null,
    verificationStatus: row.verification_status ?? "pending",
    verifiedAt: row.verified_at ?? null,
    verificationNote: row.verification_note ?? null,
    active: row.active,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
  };
}

function mapJob(row: JobRow): JobPost {
  return {
    id: row.id,
    recruiterId: row.recruiter_id,
    title: row.title,
    companyName: row.company_name,
    location: row.location,
    employmentType: row.employment_type,
    description: row.description,
    requirements: row.requirements,
    salaryLabel: row.salary_label,
    contactEmail: row.contact_email ?? null,
    companyLogoUrl: row.company_logo_url ?? null,
    status: row.status,
    adminNote: row.admin_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
  };
}

async function readLocal(): Promise<LocalStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as LocalStore;
  } catch {
    return { recruiters: [], jobs: [] };
  }
}

async function writeLocal(store: LocalStore) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

function newId() {
  return crypto.randomUUID();
}

export async function registerRecruiter(input: {
  name: string;
  email: string;
  password: string;
  company: string;
  logoUrl: string;
  whatsapp?: string;
}): Promise<Recruiter> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const company = input.company.trim();
  const whatsapp = input.whatsapp?.trim() || null;
  const logoUrl = input.logoUrl.trim();
  const passwordHash = hashPassword(input.password);

  if (!logoUrl) throw new Error("LOGO_REQUIRED");

  if (isSupabaseAdminConfigured()) {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("tc_recruiters")
      .insert({
        name,
        email,
        password_hash: passwordHash,
        company,
        whatsapp,
        logo_url: logoUrl,
        verification_status: "pending",
      })
      .select("*")
      .single();
    if (error) {
      if (error.code === "23505") throw new Error("EMAIL_TAKEN");
      throw error;
    }
    return mapRecruiter(data as RecruiterRow);
  }

  const store = await readLocal();
  if (store.recruiters.some((r) => r.email === email)) {
    throw new Error("EMAIL_TAKEN");
  }
  const row: RecruiterRow = {
    id: localRecruiterId(email),
    name,
    email,
    password_hash: passwordHash,
    company,
    whatsapp,
    logo_url: logoUrl,
    verification_status: "pending",
    verified_at: null,
    verification_note: null,
    active: true,
    created_at: new Date().toISOString(),
    last_login_at: null,
  };
  store.recruiters.push(row);
  await writeLocal(store);
  return mapRecruiter(row);
}

export async function authenticateRecruiter(
  emailRaw: string,
  password: string,
): Promise<Recruiter | null> {
  const email = emailRaw.trim().toLowerCase();

  if (isSupabaseAdminConfigured()) {
    const sb = createAdminClient();
    const { data } = await sb
      .from("tc_recruiters")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    if (!data) return null;
    const row = data as RecruiterRow;
    if (!row.active || !verifyPassword(password, row.password_hash)) return null;
    const now = new Date().toISOString();
    await sb
      .from("tc_recruiters")
      .update({ last_login_at: now })
      .eq("id", row.id);
    return mapRecruiter({ ...row, last_login_at: now });
  }

  const store = await readLocal();
  const row = store.recruiters.find((r) => r.email === email);
  if (!row || !row.active || !verifyPassword(password, row.password_hash)) {
    return null;
  }
  row.last_login_at = new Date().toISOString();
  await writeLocal(store);
  return mapRecruiter(row);
}

export async function getRecruiterById(id: string): Promise<Recruiter | null> {
  if (isSupabaseAdminConfigured()) {
    const sb = createAdminClient();
    const { data } = await sb
      .from("tc_recruiters")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return data ? mapRecruiter(data as RecruiterRow) : null;
  }
  const store = await readLocal();
  const row = store.recruiters.find((r) => r.id === id);
  return row ? mapRecruiter(row) : null;
}

export async function listRecruiters(): Promise<Recruiter[]> {
  if (isSupabaseAdminConfigured()) {
    const sb = createAdminClient();
    const { data } = await sb
      .from("tc_recruiters")
      .select("*")
      .order("created_at", { ascending: false });
    return (data ?? []).map((r) => mapRecruiter(r as RecruiterRow));
  }
  const store = await readLocal();
  return store.recruiters
    .map(mapRecruiter)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updateRecruiterVerification(
  id: string,
  status: VerificationStatus,
  note?: string | null,
): Promise<Recruiter | null> {
  const now = new Date().toISOString();
  const verifiedAt = status === "approved" ? now : null;
  const verificationNote = note?.trim() || null;

  if (isSupabaseAdminConfigured()) {
    const sb = createAdminClient();
    const { data } = await sb
      .from("tc_recruiters")
      .update({
        verification_status: status,
        verified_at: verifiedAt,
        verification_note: verificationNote,
      })
      .eq("id", id)
      .select("*")
      .maybeSingle();
    return data ? mapRecruiter(data as RecruiterRow) : null;
  }

  const store = await readLocal();
  const row = store.recruiters.find((r) => r.id === id);
  if (!row) return null;
  row.verification_status = status;
  row.verified_at = verifiedAt;
  row.verification_note = verificationNote;
  await writeLocal(store);
  return mapRecruiter(row);
}

export async function createJob(input: {
  recruiterId: string;
  title: string;
  companyName: string;
  location: string;
  employmentType: EmploymentType;
  description: string;
  requirements: string;
  salaryLabel?: string;
  contactEmail: string;
  companyLogoUrl: string;
}): Promise<JobPost> {
  const now = new Date().toISOString();
  if (isSupabaseAdminConfigured()) {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("tc_job_posts")
      .insert({
        recruiter_id: input.recruiterId,
        title: input.title.trim(),
        company_name: input.companyName.trim(),
        location: input.location.trim(),
        employment_type: input.employmentType,
        description: input.description.trim(),
        requirements: input.requirements.trim(),
        salary_label: input.salaryLabel?.trim() || null,
        contact_email: input.contactEmail.trim().toLowerCase(),
        company_logo_url: input.companyLogoUrl.trim(),
        status: "pending",
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapJob(data as JobRow);
  }

  const store = await readLocal();
  const row: JobRow = {
    id: newId(),
    recruiter_id: input.recruiterId,
    title: input.title.trim(),
    company_name: input.companyName.trim(),
    location: input.location.trim(),
    employment_type: input.employmentType,
    description: input.description.trim(),
    requirements: input.requirements.trim(),
    salary_label: input.salaryLabel?.trim() || null,
    contact_email: input.contactEmail.trim().toLowerCase(),
    company_logo_url: input.companyLogoUrl.trim(),
    status: "pending",
    admin_note: null,
    created_at: now,
    updated_at: now,
    published_at: null,
  };
  store.jobs.push(row);
  await writeLocal(store);
  return mapJob(row);
}

export async function updateJob(
  id: string,
  input: Partial<{
    title: string;
    companyName: string;
    location: string;
    employmentType: EmploymentType;
    description: string;
    requirements: string;
    salaryLabel: string | null;
    companyLogoUrl: string | null;
    status: JobStatus;
    adminNote: string | null;
    publishedAt: string | null;
  }>,
  options?: { recruiterId?: string },
): Promise<JobPost | null> {
  const now = new Date().toISOString();

  if (isSupabaseAdminConfigured()) {
    const sb = createAdminClient();
    const patch: Record<string, unknown> = { updated_at: now };
    if (input.title !== undefined) patch.title = input.title.trim();
    if (input.companyName !== undefined)
      patch.company_name = input.companyName.trim();
    if (input.location !== undefined) patch.location = input.location.trim();
    if (input.employmentType !== undefined)
      patch.employment_type = input.employmentType;
    if (input.description !== undefined)
      patch.description = input.description.trim();
    if (input.requirements !== undefined)
      patch.requirements = input.requirements.trim();
    if (input.salaryLabel !== undefined)
      patch.salary_label = input.salaryLabel?.trim() || null;
    if (input.companyLogoUrl !== undefined)
      patch.company_logo_url = input.companyLogoUrl;
    if (input.status !== undefined) patch.status = input.status;
    if (input.adminNote !== undefined) patch.admin_note = input.adminNote;
    if (input.publishedAt !== undefined) patch.published_at = input.publishedAt;

    let query = sb.from("tc_job_posts").update(patch).eq("id", id);
    if (options?.recruiterId) {
      query = query.eq("recruiter_id", options.recruiterId);
    }
    const { data } = await query.select("*").maybeSingle();
    return data ? mapJob(data as JobRow) : null;
  }

  const store = await readLocal();
  const row = store.jobs.find((j) => j.id === id);
  if (!row) return null;
  if (options?.recruiterId && row.recruiter_id !== options.recruiterId) {
    return null;
  }
  if (input.title !== undefined) row.title = input.title.trim();
  if (input.companyName !== undefined)
    row.company_name = input.companyName.trim();
  if (input.location !== undefined) row.location = input.location.trim();
  if (input.employmentType !== undefined)
    row.employment_type = input.employmentType;
  if (input.description !== undefined)
    row.description = input.description.trim();
  if (input.requirements !== undefined)
    row.requirements = input.requirements.trim();
  if (input.salaryLabel !== undefined)
    row.salary_label = input.salaryLabel?.trim() || null;
  if (input.companyLogoUrl !== undefined)
    row.company_logo_url = input.companyLogoUrl;
  if (input.status !== undefined) row.status = input.status;
  if (input.adminNote !== undefined) row.admin_note = input.adminNote;
  if (input.publishedAt !== undefined) row.published_at = input.publishedAt;
  row.updated_at = now;
  await writeLocal(store);
  return mapJob(row);
}

export async function getJob(id: string): Promise<JobPost | null> {
  if (isSupabaseAdminConfigured()) {
    const sb = createAdminClient();
    const { data } = await sb
      .from("tc_job_posts")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return data ? mapJob(data as JobRow) : null;
  }
  const store = await readLocal();
  const row = store.jobs.find((j) => j.id === id);
  if (row) return mapJob(row);

  if (isSupabaseConfigured()) {
    const sb = createAnonClient();
    const { data } = await sb
      .from("tc_job_posts")
      .select("*")
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();
    return data ? mapJob(data as JobRow) : null;
  }
  return null;
}

export async function listJobsForRecruiter(
  recruiterId: string,
): Promise<JobPost[]> {
  if (isSupabaseAdminConfigured()) {
    const sb = createAdminClient();
    const { data } = await sb
      .from("tc_job_posts")
      .select("*")
      .eq("recruiter_id", recruiterId)
      .order("created_at", { ascending: false });
    return (data ?? []).map((j) => mapJob(j as JobRow));
  }
  const store = await readLocal();
  return store.jobs
    .filter((j) => j.recruiter_id === recruiterId)
    .map(mapJob)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listPublishedJobs(): Promise<JobPost[]> {
  if (isSupabaseConfigured()) {
    const sb = createAnonClient();
    const { data, error } = await sb
      .from("tc_job_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (!error && data) return data.map((j) => mapJob(j as JobRow));
  }
  if (isSupabaseAdminConfigured()) {
    const sb = createAdminClient();
    const { data } = await sb
      .from("tc_job_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    return (data ?? []).map((j) => mapJob(j as JobRow));
  }
  const store = await readLocal();
  return store.jobs
    .filter((j) => j.status === "published")
    .map(mapJob)
    .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
}

export async function listAllJobs(): Promise<JobPost[]> {
  if (isSupabaseAdminConfigured()) {
    const sb = createAdminClient();
    const { data: jobs } = await sb
      .from("tc_job_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    const { data: recruiters } = await sb
      .from("tc_recruiters")
      .select("id,name,email");
    const map = new Map(
      (recruiters ?? []).map((r) => [
        (r as { id: string }).id,
        r as { id: string; name: string; email: string },
      ]),
    );
    return (jobs ?? []).map((j) => {
      const job = mapJob(j as JobRow);
      const rec = map.get(job.recruiterId);
      return {
        ...job,
        recruiterEmail: rec?.email,
        recruiterName: rec?.name,
      };
    });
  }

  const store = await readLocal();
  return store.jobs
    .map((j) => {
      const rec = store.recruiters.find((r) => r.id === j.recruiter_id);
      return {
        ...mapJob(j),
        recruiterEmail: rec?.email,
        recruiterName: rec?.name,
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getPublishedJobWithRecruiter(
  id: string,
): Promise<(JobPost & { recruiterEmail: string }) | null> {
  const job = await getJob(id);
  if (!job || job.status !== "published") return null;
  const email = job.contactEmail || "";
  return { ...job, recruiterEmail: email };
}
