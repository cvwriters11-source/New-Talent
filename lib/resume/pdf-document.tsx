import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";
import { normalizeResumeCv, type ResumeCv } from "@/lib/resume/schema";
import { ensureStructuredExperience } from "@/lib/resume/structure";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 42,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111111",
    lineHeight: 1.35,
  },
  center: { textAlign: "center" },
  name: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "center",
  },
  headline: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    textAlign: "center",
    marginTop: 4,
  },
  meta: {
    fontSize: 9,
    textAlign: "center",
    marginTop: 6,
  },
  rule: {
    marginTop: 10,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    textDecoration: "underline",
    marginTop: 10,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 10,
    textAlign: "justify",
  },
  eduLine: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 2,
  },
  skillsRow: {
    flexDirection: "row",
    gap: 24,
  },
  skillsCol: {
    flex: 1,
  },
  bullet: {
    fontSize: 10,
    marginBottom: 2,
    paddingLeft: 8,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 6,
  },
  jobCompany: {
    fontSize: 10,
    flexGrow: 1,
    flexShrink: 1,
  },
  jobDates: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  jobTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
  },
  bold: {
    fontFamily: "Helvetica-Bold",
  },
  link: {
    color: "#0563C1",
    textDecoration: "underline",
  },
  pageNumber: {
    position: "absolute",
    bottom: 18,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 8,
    color: "#333333",
  },
});

function BoldText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <Text style={styles.paragraph}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <Text key={i} style={styles.bold}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
}

function listedLine(item: { title: string; detail?: string; year?: string }) {
  return [item.title, item.detail, item.year].filter(Boolean).join(" | ");
}

export function SamuelCvPdfDocument({ cv }: { cv: ResumeCv }) {
  cv = ensureStructuredExperience(normalizeResumeCv(cv));
  const mid = Math.ceil(cv.skills.length / 2);
  const skillsLeft = cv.skills.slice(0, mid);
  const skillsRight = cv.skills.slice(mid);
  const contactParts = [cv.phone, cv.email, cv.location, cv.linkedin].filter(
    Boolean,
  );

  return (
    <Document
      title={`${cv.fullName || "CV"} — Talent Crafters`}
      author="Talent Crafters"
    >
      <Page size="A4" style={styles.page}>
        <Text
          fixed
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `-- ${pageNumber} of ${totalPages} --`
          }
        />
        <Text style={styles.name}>{cv.fullName || "YOUR NAME"}</Text>
        {cv.headline ? <Text style={styles.headline}>{cv.headline}</Text> : null}
        {contactParts.length > 0 ? (
          <Text style={styles.meta}>
            {contactParts.map((part, i) => {
              const isLink =
                part.includes("@") || part.toLowerCase().includes("linkedin");
              return (
                <Text key={`${part}-${i}`}>
                  {i > 0 ? " | " : ""}
                  {isLink && part.includes("@") ? (
                    <Link src={`mailto:${part}`} style={styles.link}>
                      {part}
                    </Link>
                  ) : isLink ? (
                    <Link
                      src={
                        part.startsWith("http") ? part : `https://${part}`
                      }
                      style={styles.link}
                    >
                      {part}
                    </Link>
                  ) : (
                    part
                  )}
                </Text>
              );
            })}
          </Text>
        ) : null}
        {cv.languages.length > 0 ? (
          <Text style={styles.meta}>{cv.languages.join(" | ")}</Text>
        ) : null}
        <View style={styles.rule} />

        {cv.summary ? (
          <View>
            <Text style={styles.sectionTitle}>PERSONAL SUMMARY</Text>
            <BoldText text={cv.summary} />
          </View>
        ) : null}

        {cv.education.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {cv.education.map((ed, i) => (
              <Text key={i} style={styles.eduLine}>
                <Text style={styles.bold}>{ed.degree}</Text>
                {ed.institution ? ` | ${ed.institution}` : ""}
                {ed.year ? ` | ${ed.year}` : ""}
              </Text>
            ))}
          </View>
        ) : null}

        {cv.skills.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>Key Skills</Text>
            <View style={styles.skillsRow}>
              <View style={styles.skillsCol}>
                {skillsLeft.map((skill) => (
                  <Text key={skill} style={styles.bullet}>
                    • {skill}
                  </Text>
                ))}
              </View>
              <View style={styles.skillsCol}>
                {skillsRight.map((skill) => (
                  <Text key={skill} style={styles.bullet}>
                    • {skill}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        ) : null}

        {cv.experience.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {cv.experience.map((job, i) => (
              <View key={i}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobCompany}>
                    <Text style={styles.bold}>{job.company}</Text>
                    {job.location ? ` | ${job.location}` : ""}
                  </Text>
                  <Text style={styles.jobDates}>
                    {[job.startDate, job.endDate].filter(Boolean).join(" – ")}
                  </Text>
                </View>
                <Text style={styles.jobTitle}>{job.title}</Text>
                {job.intro ? (
                  <Text style={styles.paragraph}>{job.intro}</Text>
                ) : null}
                {job.bullets.map((bullet, bi) => (
                  <Text key={bi} style={styles.bullet}>
                    • {bullet}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {cv.affiliations.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>Professional Affiliations</Text>
            {cv.affiliations.map((item, i) => (
              <Text key={i} style={styles.eduLine}>
                {listedLine(item)}
              </Text>
            ))}
          </View>
        ) : null}

        {cv.professionalDevelopment.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>Professional Development</Text>
            {cv.professionalDevelopment.map((item, i) => (
              <Text key={i} style={styles.eduLine}>
                {listedLine(item)}
              </Text>
            ))}
          </View>
        ) : null}

        {cv.awards.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>Awards and Accomplishments</Text>
            {cv.awards.map((item, i) => (
              <Text key={i} style={styles.eduLine}>
                {listedLine(item)}
              </Text>
            ))}
          </View>
        ) : null}

        {cv.referencesNote ? (
          <View>
            <Text style={styles.sectionTitle}>REFERENCES</Text>
            <Text style={styles.center}>• {cv.referencesNote}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
