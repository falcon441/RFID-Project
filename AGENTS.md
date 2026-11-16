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

- All demo data lives in src/lib/mock-data.ts with a fixed reference time — swap these exports for API calls when a backend exists; fixed time keeps server and browser renders identical.
- Signed-in console pages are children of the pathless `_console` layout (sidebar + top bar); the sign-in page is `/`.
