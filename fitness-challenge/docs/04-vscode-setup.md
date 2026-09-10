# 04 — VS Code Setup

## 1. Toolchain

### Windows (PowerShell)

```powershell
# .NET SDK — check what's already there
dotnet --list-sdks

# If missing:
winget install Microsoft.DotNet.SDK.8      # verified: 8.0.303
# (or grab the current LTS installer from the Microsoft .NET download page)

# EF Core CLI tools
dotnet tool install --global dotnet-ef

# Optional: the project runs on plain HTTP port 5080, so you don't need this
# dotnet dev-certs https --trust

# Node — Angular CLI 22 requires Node ^22.22.3, ^24.15.0 or >=26
winget install OpenJS.NodeJS.LTS         # verified: 24.19.0 with npm 11.17.0
# then CLOSE AND REOPEN the terminal so PATH refreshes

npm install -g @angular/cli              # verified: 22.1.7
ng version
```

**PowerShell line continuation is a backtick (`` ` ``), not a backslash.** Bash-style `\` at the
end of a line will break the command. Easiest is to just run each command on its own line.

**Avoid OneDrive-synced folders** (Desktop and Documents usually are). `node_modules` contains
tens of thousands of files; OneDrive will slow builds to a crawl and occasionally lock a file
mid-`npm install`. Put the repo somewhere like `C:\dev\fitness-challenge`.

**Line endings**: run `git config --global core.autocrlf true` before the first commit so the
repo stays LF while your working copy is CRLF. The `.editorconfig` in section 7 sets `end_of_line = lf`.

### Ubuntu / Linux

```bash
dotnet --list-sdks
sudo apt update && sudo apt install -y dotnet-sdk-8.0

dotnet tool install --global dotnet-ef
echo 'export PATH="$PATH:$HOME/.dotnet/tools"' >> ~/.bashrc && source ~/.bashrc

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
nvm install --lts
npm install -g @angular/cli
ng version
```

Check the Angular CLI's required Node version before installing — each Angular major supports a
specific Node range, and `ng new` will refuse outright if you're outside it.

## 2. Extensions you actually need

### Essential

| Extension | ID | Why |
|---|---|---|
| **C# Dev Kit** | `ms-dotnettools.csdevkit` | Solution explorer, test runner, project management. Pulls in the C# extension and .NET Install Tool automatically. Requires signing in with a Microsoft account; free for individuals, students and OSS, paid for larger organizations. |
| **C#** | `ms-dotnettools.csharp` | The actual language server (Roslyn). Installed as a dependency of Dev Kit, listed here in case you skip Dev Kit. |
| **Angular Language Service** | `Angular.ng-template` | Template type-checking, autocomplete in HTML, go-to-definition across component/template. Non-negotiable for Angular work. |
| **ESLint** | `dbaeumer.vscode-eslint` | After `ng add @angular-eslint/schematics`. |
| **Prettier** | `esbenp.prettier-vscode` | Consistent formatting across TS/HTML/SCSS/JSON/MD. |
| **EditorConfig** | `EditorConfig.EditorConfig` | Keeps C# and TS indentation rules from fighting each other. |

### Strongly recommended

| Extension | ID | Why |
|---|---|---|
| **REST Client** | `humao.rest-client` | Run `.http` files straight from the editor. Beats alt-tabbing to Postman, and the `requests.http` file becomes a deliverable that impresses reviewers. |
| **SQLite Viewer** | `qwtel.sqlite-viewer` | Click `fitness.db` and browse tables. Freemium: the free tier is read-only with ads and **no query runner** — fine for checking that the seeder ran. If you need to run SQL, use `alexcvzz.vscode-sqlite` (unmaintained since 2022 but works on Windows) or just `sqlite3.exe` from the terminal. |
| **GitLens** | `eamodio.gitlens` | Blame, history, and cleaner commit review before you push. |
| **Error Lens** | `usernamehw.errorlens` | Inline errors — catches TS strict-mode issues fast. |

### Optional / nice to have

| Extension | ID | Why |
|---|---|---|
| **Markdown All in One** | `yzhang.markdown-all-in-one` | TOC and table formatting for these docs and your README. Also useful with your Obsidian vault. |
| **Markdown Preview Mermaid Support** | `bierner.markdown-mermaid` | If you add architecture diagrams to the README. |
| **Path Intellisense** | `christian-kohler.path-intellisense` | Import path autocomplete. |
| **Code Spell Checker** | `streetsidesoftware.code-spell-checker` | Typos in public identifiers look sloppy in a take-home. |

### Skip these

- **Thunder Client** — parts of it moved behind a paid tier; REST Client does the job for free.
- **Prettier for C#** — don't. Use `dotnet format` and `.editorconfig` for C#, Prettier for the frontend only.
- **Any "Angular snippets" pack** — the Language Service plus the CLI schematics cover it.

## 3. `.vscode/extensions.json` (commit this)

```json
{
  "recommendations": [
    "ms-dotnettools.csdevkit",
    "ms-dotnettools.csharp",
    "Angular.ng-template",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "EditorConfig.EditorConfig",
    "humao.rest-client",
    "qwtel.sqlite-viewer"
  ]
}
```

## 4. `.vscode/settings.json`

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[csharp]": { "editor.defaultFormatter": "ms-dotnettools.csharp" },
  "dotnet.defaultSolution": "backend/FitnessChallenge.sln",
  "typescript.tsdk": "frontend/fitness-challenge-web/node_modules/typescript/lib",
  "files.exclude": {
    "**/bin": true,
    "**/obj": true
  }
}
```

## 5. `.vscode/tasks.json`

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "backend: run",
      "type": "shell",
      "command": "dotnet run --project backend/FitnessChallenge.Api",
      "problemMatcher": "$msCompile",
      "isBackground": true
    },
    {
      "label": "backend: test",
      "type": "shell",
      "command": "dotnet test backend/FitnessChallenge.sln",
      "group": "test",
      "problemMatcher": "$msCompile"
    },
    {
      "label": "frontend: serve",
      "type": "shell",
      "command": "npm start",
      "options": { "cwd": "${workspaceFolder}/frontend/fitness-challenge-web" },
      "isBackground": true,
      "problemMatcher": []
    },
    {
      "label": "run all",
      "dependsOn": ["backend: run", "frontend: serve"],
      "dependsOrder": "parallel"
    }
  ]
}
```

`Ctrl+Shift+P` → *Tasks: Run Task* → **run all** starts both halves at once.

## 6. `.vscode/launch.json` (debugging the API)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug API",
      "type": "coreclr",
      "request": "launch",
      "preLaunchTask": "build",
      "program": "${workspaceFolder}/backend/FitnessChallenge.Api/bin/Debug/net8.0/FitnessChallenge.Api.dll",
      "cwd": "${workspaceFolder}/backend/FitnessChallenge.Api",
      "env": { "ASPNETCORE_ENVIRONMENT": "Development" },
      "serverReadyAction": {
        "action": "openExternally",
        "pattern": "\\bNow listening on:\\s+(https?://\\S+)",
        "uriFormat": "%s/swagger"
      }
    }
  ]
}
```

`net8.0` is correct for SDK 8.0.303. Adjust only if you retarget the project.

## 7. `.editorconfig` at repo root

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.{cs,csx}]
indent_style = space
indent_size = 4
csharp_new_line_before_open_brace = all
dotnet_sort_system_directives_first = true

[*.{ts,html,scss,json,md,yml}]
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

## 8. Daily loop

```bash
# terminal 1
dotnet watch --project backend/FitnessChallenge.Api

# terminal 2
cd frontend/fitness-challenge-web
npm start

# terminal 3, before every commit
dotnet test
dotnet format --verify-no-changes
```

In PowerShell, chain commands with `;` rather than `&&` on older versions — or just run them
separately, as above.

Backend: `http://localhost:5080` · Swagger: `http://localhost:5080/swagger` ·
Frontend: `http://localhost:4200`
