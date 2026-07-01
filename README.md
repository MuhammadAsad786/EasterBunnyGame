# Easter Bunny Runner — Marketing Website

A small, animated promotional site for the **Easter Bunny Runner** Android game.
Three pages: **Home**, **Privacy Policy**, **Contact Us**.

This folder is intentionally **separate from the game project** (`EasterBunnyRunner/`) — it's a
standalone static website with no build step.

## Run it

Just open `index.html` in any modern browser (double-click works via `file://`).
For the smoothest experience (and to avoid any browser quirks), serve it locally:

```bash
# from inside this folder
python -m http.server 8080
# then visit http://localhost:8080
```

Then deploy the whole folder to any static host (GitHub Pages, Netlify, Vercel, Firebase Hosting, etc.).

## Structure

```
EasterBunnyRunner-Website/
├── index.html        # Home — hero, controls, characters, features, screenshots
├── privacy.html      # Privacy Policy (accurate to the app's permissions & data use)
├── contact.html      # Contact Us — form that opens the visitor's email app (mailto)
├── assets/
│   ├── css/styles.css
│   ├── js/main.js    # GSAP + Lenis animations + form handling (progressive enhancement)
│   └── img/          # game art copied from the project's drawable resources
└── README.md
```

## Things you'll want to customise

### 1. Google Play link
The "Get it on Google Play" buttons currently point to a placeholder.
Search all three HTML files for:

```
#REPLACE_WITH_PLAY_STORE_URL
```

and replace each with your real Play Store listing URL
(e.g. `https://play.google.com/store/apps/details?id=com.example.drop.zone`).

### 2. Real screenshots (optional)
The Home page **Screenshots** section uses composed mockups built from the real game art,
plus one labeled **placeholder slot**. To use real device captures:

1. Take screenshots on your phone (portrait, roughly **9:19** ratio looks best).
2. Drop the image files into `assets/img/` (e.g. `shot1.png`, `shot2.png`).
3. In `index.html`, find the `#screenshots` section and replace a `.shot-frame` block
   (or the `.placeholder-shot` block) with:
   ```html
   <div class="shot-frame">
     <div class="shot-inner"><img class="bgshot" src="assets/img/shot1.png" alt="Gameplay screenshot" /></div>
   </div>
   ```

### 3. Contact email
The contact form and footer links use **bushramanzoor302@gmail.com**.
- Form destination lives on the `<form data-mailto="...">` attribute in `contact.html`.
- Submitting builds a `mailto:` link and opens the visitor's email app (no server needed).

## Tech notes

- **Animations:** [GSAP](https://gsap.com) + ScrollTrigger (hero timeline, scroll reveals,
  parallax, counters) and [Lenis](https://github.com/darkroomengineering/lenis) for smooth scrolling.
  All loaded from CDN.
- **Progressive enhancement:** if the CDNs fail to load or JavaScript is disabled, every page
  still shows all its content and the contact form falls back to a plain email link. Animations
  are purely additive.
- **Reduced motion:** respects the OS "reduce motion" setting and disables animation accordingly.
- **Font:** Fredoka (Google Fonts) to match the in-game typeface.
- **Images:** ~34 art files copied from the game's `app/src/main/res/drawable` and the launcher
  icon. They are independent copies — editing them here does not affect the game.

---

Made with 🥕 to show off Easter Bunny Runner.
