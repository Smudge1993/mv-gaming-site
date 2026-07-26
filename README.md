# Minervan Vanguard website

A responsive static website for **mv-gaming.org**. It uses plain HTML, CSS and JavaScript, so there is no build process and no paid website builder is required.

## What to edit first

Open `site-config.js` in any text editor and replace:

- `discordInvite`
- `starCitizenOrganisation`
- `tornPage`
- `gameTitle`
- `gameDescription`

All placeholder external buttons remain safely disabled until you enter real links.

To change the larger paragraphs, update cards or headings, edit `index.html`.

## Preview it on your computer

Double-clicking `index.html` will usually work.

For the most accurate preview, use Visual Studio Code with the **Live Server** extension:

1. Open the project folder in Visual Studio Code.
2. Install the extension called **Live Server**.
3. Right-click `index.html`.
4. Select **Open with Live Server**.

## Publish using GitHub Pages

### 1. Create the repository

1. Create or sign in to a GitHub account.
2. Click **New repository**.
3. Name it `mv-gaming-site`.
4. Set it to **Public**.
5. Create the repository.

### 2. Upload this website

1. Open the new repository.
2. Choose **Add file → Upload files**.
3. Upload the contents of this folder, including the `assets` folder.
4. Commit the files to the `main` branch.

Do not upload the outer ZIP file by itself. GitHub needs to see `index.html` at the top level of the repository.

### 3. Switch on GitHub Pages

1. Open the repository's **Settings**.
2. Select **Pages** in the sidebar.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose branch `main`.
5. Choose folder `/(root)`.
6. Click **Save**.

GitHub will show a temporary address similar to:

`https://YOUR-USERNAME.github.io/mv-gaming-site/`

Test that address before changing the domain.

### 4. Add mv-gaming.org in GitHub

In **Settings → Pages**, enter:

`mv-gaming.org`

under **Custom domain**, then click **Save**.

Do this before changing the DNS records.

### 5. Point the Squarespace-managed domain to GitHub

In Squarespace:

1. Open the **Domains dashboard**.
2. Select `mv-gaming.org`.
3. Open **DNS → DNS Settings**.
4. Look under **Custom Records**.
5. Remove only conflicting website records for `@` or `www`.
6. Do not delete email-related MX or TXT records.

Add these four records:

| Type | Name | Data |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

Then add:

| Type | Name | Data |
|---|---|---|
| CNAME | www | YOUR-USERNAME.github.io |

Replace `YOUR-USERNAME` with your actual GitHub username. Do not add the repository name to the CNAME value.

### 6. Switch on HTTPS

Return to **GitHub → repository Settings → Pages**.

Once the DNS check succeeds, enable **Enforce HTTPS**. DNS and the security certificate can take time to update.

## Folder structure

```text
minervan-vanguard-site/
├── index.html
├── styles.css
├── site-config.js
├── script.js
├── .nojekyll
├── README.md
└── assets/
    ├── favicon.png
    ├── minervan-vanguard-white.png
    └── minervan-vanguard-colour.png
```

## Important

This is a static website. It is excellent for pages, screenshots, news posts and outbound links. Features such as user accounts, a database, automatic posting or a private admin panel would need a backend or a content-management system later.
