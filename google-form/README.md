# Event registrations while the website is down

Two scripts work together:

1. **`create-registration-form.gs`** builds the Google Form people register with.
2. **`../scripts/import-form-registrations.ts`** copies the form's responses into the website database, so everyone appears on the event's admin page.

Both are tested together (`src/lib/events/form-import.roundtrip.test.ts`): the test runs the form script, builds the spreadsheet Google would produce from it, and imports it. If a form question is renamed without updating the importer, that test fails.

## Part 1: create the form (once)

1. Go to <https://script.google.com> and click **New project**.
2. Delete the sample code, paste in the whole of `create-registration-form.gs`, and click **Save**.
3. In the function menu at the top choose **createGreenwaveRegistrationForm**, then click **Run**.
4. Google asks for permission the first time. Click **Review permissions**, pick your account, then **Advanced** and **Go to project (unsafe)**. This warning appears for every personal script; it only lets the script create a Form and a Sheet in your own Drive.
5. Open **Execution log** at the bottom and copy the links:
   * **General registration link**: people choose Attendee, Volunteer or Vendor.
   * **Volunteer link** and **Vendor link**: open with that option already ticked.
   * **Attendee link**, **Edit the form**, and **Responses spreadsheet**.

Run it only once. Each run creates a brand new form and sheet.

To change the event name, date or contact number, edit the three lines near the top (`EVENT_NAME`, `EVENT_DATE`, `CONTACT`) before running. You can reword descriptions and help text afterwards from the form's edit link, but **do not rename the questions** (the importer matches them by their exact wording).

## Part 2: copy registrations into the website database (as often as you like)

You need the project on a computer with Node.js, and the database connection string in `.env.local`:

```
DATABASE_URL="postgresql://..."
```

1. Open the responses spreadsheet and choose **File > Download > Comma separated values (.csv)**.
2. Preview, which saves nothing:

```bash
npx tsx scripts/import-form-registrations.ts --csv responses.csv
```

3. If the list looks right, import:

```bash
npx tsx scripts/import-form-registrations.ts --csv responses.csv --apply
```

Download a fresh CSV and run it again whenever new responses come in. People already registered for the event (matched by email, whether they came from the form or the website) are skipped, so nobody is added twice.

By default it adds people to the **Trivia & Games Night on 18 November 2026**. For another event, add `--event <slug>`; if it cannot tell which event you mean, it lists the upcoming ones.

## What happens to each person

| Registered as | On the admin page | Takes a place? |
|---|---|---|
| Attendee | Attendee (or Member, if their email matches a member) | Yes, waitlisted once the event is full |
| Vendor | Vendor badge with their business name | Yes, like vendors who sign up on the website |
| Volunteer | Volunteer badge | **No**, volunteers are always confirmed and never fill up the event |

All their other answers (roles, stall needs, M-Pesa code and so on) are under **View details**.

## When the website is back

* Form registrations and website sign-ups share the same list and the same capacity count, so you can keep using both, or switch back to the website.
* People imported from the form did not receive the website's confirmation email. They do receive the automatic reminder emails before the event, like everyone else.
