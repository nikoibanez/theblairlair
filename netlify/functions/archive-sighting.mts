import type { FormSubmittedEvent } from "@netlify/functions"

const REVIEW_REPO = "nikoibanez/theblairlair-submissions"
const REVIEW_BRANCH = "main"

function clean(value: unknown, limit = 1200) {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, limit)
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42) || "unknown-location"
}

function quote(value: string) {
  return value.split(/\r?\n/).map(line => `> ${line}`).join("\n")
}

export default {
  async formSubmitted(event: FormSubmittedEvent) {
    const data = event.data || {}
    const formName = clean(data["form-name"], 80)
    if (formName && formName !== "blair-sighting") return

    const location = clean(data.location, 80)
    const report = clean(data.report, 700)
    const rating = clean(data.rating, 80)
    if (!location || !report) return

    const token = process.env.GITHUB_SUBMISSION_TOKEN
    if (!token) {
      console.error("GITHUB_SUBMISSION_TOKEN is not configured; sighting remains available in Netlify Forms.")
      return
    }

    const submittedAt = new Date().toISOString()
    const stamp = submittedAt.replace(/[:.]/g, "-")
    const filename = `submissions/pending/${stamp}-${slugify(location)}.md`
    const markdown = `# Pending Blair sighting\n\n- **Submitted:** ${submittedAt}\n- **Approximate location:** ${location.replace(/`/g, "'")}\n- **Evidence rating:** ${rating.replace(/`/g, "'") || "unspecified"}\n- **Review status:** pending\n\n## Witness report\n\n${quote(report)}\n\n---\n\n_Collected by the Blair Lair sighting form. Raw submission; review before publishing._\n`
    const content = Buffer.from(markdown, "utf8").toString("base64")

    const response = await fetch(`https://api.github.com/repos/${REVIEW_REPO}/contents/${filename}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "theblairlair-netlify"
      },
      body: JSON.stringify({
        message: `Archive Blair sighting: ${location.slice(0, 48)}`,
        content,
        branch: REVIEW_BRANCH
      })
    })

    if (!response.ok) {
      const detail = await response.text()
      console.error(`GitHub archive failed (${response.status}): ${detail}`)
      return
    }

    console.log(`Archived Blair sighting to ${REVIEW_REPO}/${filename}`)
  }
}
