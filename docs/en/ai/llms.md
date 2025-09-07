mdui provides two files: `llms.txt` and `llms-full.txt`. They give large language models (LLMs) accurate, citable context so the model can answer mdui questions more reliably.

## Use llms.txt to provide context to AI {#context}

Links:

- `llms.txt`: https://www.mdui.org/en/docs/2/llms.txt
- `llms-full.txt`: https://www.mdui.org/en/docs/2/llms-full.txt

`llms.txt` is a short index. It is good for models that can browse the web. They can follow the links to fetch the needed Markdown pages, or use it as a quick project overview.

`llms-full.txt` contains the full context. It includes all page contents listed by `llms.txt`. Use it when the model cannot access the internet or when you want to provide everything in one file.

## Markdown versions of the docs {#md-mirror}

Every docs page has a Markdown version. Append `.md` to the page URL (append `index.md` for the home page).

Examples:

     https://www.mdui.org/en/docs/2/components/button → https://www.mdui.org/en/docs/2/components/button.md
     https://www.mdui.org/en/docs/2/ → https://www.mdui.org/en/docs/2/index.md

You can give the Markdown URL or paste its plain text as context. This often produces more focused and accurate answers.

## How to use with ChatGPT, Claude, etc. {#how-to-use}

Choose a method based on whether the model can browse or upload files (you can also combine them):

1. Paste directly: put the content of `llms-full.txt` in the system prompt or the first message.

   Example: "Here is the mdui context. Answer strictly based on it. If there is a conflict, this context takes precedence:\n\n[paste llms-full.txt here]".

2. Upload a file: upload `llms-full.txt` (or `llms.txt`) and say in the first message: "Use the attachment as the main context".

   Example: "Based on the attached mdui docs, describe how to use `<mdui-button>` and list common pitfalls."

3. Read online: send a link to `llms.txt` or `llms-full.txt`.

   Example: "Please load and follow https://www.mdui.org/en/docs/2/llms-full.txt as context for my mdui questions."

4. Point to a specific page: if you only need one component or function, send that page’s Markdown URL.

   Example: "Please read https://www.mdui.org/en/docs/2/components/button.md and give three best practices based on it."

Tip: Click the <mdui-icon name="auto_awesome"></mdui-icon> icon at the top right of any page to quickly copy these links, open the Markdown version, or open the current page or `llms-full.txt` in ChatGPT as context.
