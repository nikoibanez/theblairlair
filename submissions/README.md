# Reviewed Blair submissions

Raw reports are collected privately through Netlify Forms and trigger an email notification to `supereukarya@gmail.com`.

This public directory is for **reviewed and approved** Blair lore only. Do not commit raw submissions containing real names, private addresses, phone numbers, email addresses, or other identifying information.

To archive an approved submission:

```bash
npm run review:add -- --location "approximate location" --report "reviewed report text" --rating "could be Blair"
```

Or export/copy a submission to JSON and run:

```bash
npm run review:add -- --file ./reviewed-submission.json
```

The script writes a dated Markdown file here. Review that file once more before committing it to `main`.
