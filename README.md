#  AL-ATASH FIT Health Assess

Create a production-ready AL-ATASH FIT Weight Assessment web app. Use the three reference designs from our conversation as the visual direction: a high-resolution, polished bilingual Urdu + English clinic assessment form, with AL-ATASH FIT branding, rounded section cards, colored headers, checkboxes, fill-in inputs, icons, and responsive mobile layout. Do NOT use a flat poster image as the form; recreate all fields as real HTML inputs. Landing page: AL-ATASH FIT branding and three large choices: Child / Female / Male. Selecting one opens its dedicated assessment form. Child form: basic information, age/sex/school/guardian, weight/height/BMI, weight and health history, medical history, medications, daily food habits, lifestyle/activity/sleep/screen time, dietary preferences/allergies, parent/guardian information, notes and consent. Female form: all equivalent sections plus women-specific health: pregnancy history, current pregnancy, breastfeeding, menstrual/menopause status, PCOS, anemia, vitamin D, hormonal/medical details. Male form: all equivalent sections plus male-specific health/medical details. Include automatic BMI calculation where height and weight are entered, with a clear disclaimer that BMI is informational. On submit, validate fields, show a success screen, generate a unique submission ID, and save the full submission to Airtable with submission type (Child/Female/Male), timestamp, and all form fields. Build a private Admin Dashboard with login, searchable/filterable submissions, detail view, and CSV export. Public respondent pages must not expose admin data or Airtable credentials. Use Airtable as the source of truth and integrate via a secure server-side connector; if an Airtable connection/PAT must be supplied by the owner, make that the only clearly surfaced setup step. Make the app production-quality, accessible, mobile-first, and easy to share by one public URL. Add a simple AL-ATASH FIT logo treatment using the brand name and A icon styling if the exact logo asset is unavailable.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://al-atash-fit-tracker.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f91da5d3-0c35-47e1-88fe-9480634ea33f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
