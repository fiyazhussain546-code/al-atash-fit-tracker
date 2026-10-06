<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Public Medical Consultancy intake lives at /consultancy-assessment/$specialty; uploads go to the private consultancy-documents bucket via server functions only, staff open them with short-lived signed links. Why: patient files must never be publicly reachable.
- Intake questions live in src/lib/intake-questions.ts (common + per-specialty) and are shared by the public form and the staff assessment tab. Why: one source of truth for questions.
