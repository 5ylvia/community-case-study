# DESIGN.md — Dajeong

> Design system documentation for Dajeong — visual language, tokens, and component patterns.

---

## 0. Design Summary

**"A hand-written neighborhood board on warm paper."**
Not a cold tech app, but a warm community with ink-brown (dark brown) text and the flame of Jeong on cream-toned paper. Rounded, soft, and human.

Core mood: Warmth, neighborliness, simplicity, handmade feel.
Avoid: Coldness, fluorescent/neon, achromatic minimalism, serif headlines.

---

## 1. Color

### Tokens (Tailwind `@theme` in `index.css`)
The logo's 3 colors form the brand core — flame-red (#960100, body) / flame (#FEB700, heart) / ink (#4F1F0A, text).
```
--color-paper       #f6efe2   /* Main background — warm cream (paper) */
--color-paper2      #fbf6ec   /* Tab bar / section dividers — light cream */
--color-card        #fffdf8   /* Card background — near-white cream */
--color-ink         #4f1f0a   /* Main text — ink brown */
--color-ink-soft    #8a6b52   /* Secondary text — soft brown */
--color-flame       #feb700   /* Jeong flame yellow — accent / highlight */
--color-flame-red   #960100   /* Flame red — full Ember cells / destructive confirm */
--color-ember       #f57c1a   /* Orange — primary buttons + Ember progress cells */
--color-ember-deep  #d9601a   /* Deep orange — avatars / accent text */
--color-herb        #6f8f54   /* Herb green — completed / success states */
--color-line        rgba(79,31,10,0.12)  /* Borders / dividers — ink brown 12% */
```
- **Primary button (ember #f57c1a) text is white** (700 bold).

### Key Principle: Color is used only for "function (role)". Never for category distinction.

| Color | Fixed Role |
|-------|-----------|
| `ember` (orange) | **Primary action buttons only** + Ember progress cells. Do not use for filter chips or other elements. |
| `herb` (green) | **Completed / success states** (joined, applied, done) |
| `flame` (yellow) | **Accent / highlight** (popular Local Eats glow, waitlist status) |
| `flame-red` (red) | **Full Ember cells + destructive action confirm** (cancel, etc.) |
| `ink` (brown) | **Main text + active filters + FAB** |
| `ink-soft` (light brown) | **Secondary text + empty Ember cells** |

### Other Rules
- **Background is always cream (`paper`).** Pure white (#FFF) is forbidden.
- **Text is ink brown (`ink`), never black.**
- **Flame colors (yellow/red/orange) are accent only.** No large surfaces.
- **Hover system:**
  - ember button: `hover:bg-ember-deep` + shadow.
  - ink small button: `hover:-translate-y-0.5 + shadow-md`.
  - Header icons: default `bg-ink/6`, hover `hover:bg-transparent`.
- **Categories are distinguished by icons, not colors.**
- No dark mode. Always light (cream).

---

## 2. Typography

- **Font:** **Pretendard Variable** (Korean sans-serif). Fallback: system-ui, sans-serif.
- **No serif.** Logo is SVG image only.

### Scale (Mobile Base)
```
Page tagline       22px / 700
Subtitle/desc      13px / 400 / ink-soft / leading-relaxed
Card title         16px / 700
Body               13.5px / 400 / leading-relaxed
Meta/secondary     12.5px / 500-600 / ink-soft
Location/suburb    11.5px / ink-soft
Tags/badges        11px / 600-700
```
- Weights: primarily **700 (bold) and 400 (regular)**.
- Body line-height: `leading-relaxed` (1.625).

---

## 3. Spacing & Layout

- **Mobile-first, desktop responsive.** Max width `480px` (`max-w-120`) container, centered.
- **Desktop (md+):** Left sidebar (80px) + content area.
- **Horizontal padding:** `px-4`.
- **Card spacing (vertical):** `mb-3`. **Card inner padding:** `p-4`.
- **Page top:** `pt-1` (below Header). **Page bottom:** `pb-40` (tab bar + FAB height).
- **Filter chip spacing:** `gap-2`, `mb-4`.

---

## 4. Shape (Corners, Borders, Shadows)

- **Corners:** Cards `rounded-2xl` / Modals `rounded-t-[20px]` / Chips & tags `rounded-full` / Large buttons (ember) `rounded-xl` / Small buttons (ink) `rounded-lg`.
- **Borders:** 1px `border-line` (brown 12%).
- **Shadows:** Rarely used. Exceptions:
  - Popular Local Eats glow: `shadow-[0_0_12px_rgba(254,183,0,0.33)]`
  - FAB: `shadow-[0_8px_22px_rgba(79,31,10,0.28)]`

---

## 5. Component Patterns

### Buttons
- **Card join button:** `bg-ink` white text, `rounded-lg py-2 px-4 text-[13px]` 700. hover: `-translate-y-0.5 shadow-md`.
- **Modal submit button:** `bg-ember` white text, `rounded-xl`. hover: `bg-ember-deep` + shadow.
- **Submit button disabled:** `bg-ink/20 text-ink-soft cursor-not-allowed`.
- **Completed state (joined/applied):** `bg-paper2 border-herb text-herb`. Click triggers cancel ConfirmModal.
- **Waitlisted:** `bg-flame/10 border-flame text-flame`.
- **Filter inactive:** `bg-card border-line text-ink`.
- **Filter active:** `bg-ink text-paper`.
- **FAB:** Mobile = full-width bar `bg-ember text-white rounded-[14px]`. Desktop = bottom-right circle + icon `bg-ember`. hover: `bg-ember-deep` + shadow.
  - FAB labels: Home Meal "+ Start a Home Meal" / Together "Find people to join" / Local Eats "Recommend a spot"

### Button Radius Rules
- **Large buttons (ember — FAB/modal actions):** `rounded-xl`
- **Small buttons (ink/card join):** `rounded-lg py-2 text-[13px]`

### Cards
- `bg-card rounded-2xl p-4 border border-line`.
- **Layout (Home Meal / Together shared):**
  ```
  [Type icon Title]            Pin Location (top right — hidden if no suburbName)
  [Reason tags max 2]          <- Together only
  [Description body line-clamp-3]
  [Calendar Date] [Chat Count]  |  [Host name Ember]
  [Host avatar + participant avatars (max 3, +N) + count]  |  [Status badge]
  ```
  - Card click -> DetailPage. Cards show status badges only (no action buttons).
  - Host sees edit (Pencil) icon at top right of card.
  - **Avatars:** Host = `bg-ember-deep`, participants = `bg-ink-soft`. Host always first. Overlap: `-space-x-1.5`.
  - **Status badges (border + rounded-lg):** Crown My group (ember, host priority) / Check Joined (herb) / Hourglass Waitlisted (flame).
  - **Capacity display:** capacity null = "N joined". capacity set = "N/M". Full: `[Full]` badge (gray) before title + card dimmed. Count includes host.
  - **Comment count:** ChatCircle icon + N. After date, before capacity.
  - **Location:** Always top right. Hidden if suburbName is empty string.
  - **Together address:** If starts with http, show "View map" link (`text-ember-deep underline`), otherwise CopyableAddress (copyable), hidden if empty.

- **Local Eats card layout:**
  ```
  [Category tag] Restaurant name              Pin Location (top right)
  One-line review body
  Yellow-heart N / [Author] recommends / Pin Map    [Heart like button, right]
  ```
  - Like (Heart): Before press `regular`, after `fill` (flame yellow). Click directly on card (no DetailPage).
  - Unlike: Re-click to undo immediately. AlertBanner `"Like removed."`.
  - **Home Meal address:** Only shown to confirmed attendees within 24h. Before that: "Pin Detailed location will be revealed 24 hours before".

- **Title/description truncation:** Title `line-clamp-1`, description `line-clamp-3`.
- Popular Local Eats (top 3): `glow` prop for yellow glow.

### Chips, Tags & Button Visual Hierarchy

| Element | Fill | Size |
|---------|------|------|
| **Action button** | Solid fill (`bg-ink`, FAB=`bg-ember`) | `px-4 py-2 rounded-lg` 13px 700 |
| **Filter chip** | Active only `bg-ink`, inactive outline | `px-4 py-1 rounded-full` 11.5px 600 |
| **Tag/badge** | Light background | `px-2.5 py-0.5 rounded-full` 11px |

- **Filter chips (Chip):** Active=`bg-ink text-paper`, inactive=`bg-card text-ink-soft border-line`. 4+ chips scroll horizontally. Hidden scrollbar: `hide-scrollbar` class.
- **MyActivity filter chips:** All / My Groups / Joined / Waitlisted. Default 3 + show more.
- **Reason tags** (Together only, label purpose): `bg-ember/12 text-ember-deep border-ember/25 text-[11px] font-semibold`. Max 2 on card, all on DetailPage.
- **Type badges:** Neutral `bg-ink/6 text-ink-soft border-line`. Distinguished by icon only.
- **Popular Local Eats likes:** Each card `Yellow-heart N`. Top 3 shown at feed top with glow. Likes are Heart (flame yellow), distinct from Ember (red/orange fire).

### Avatars
- `w-6 h-6 rounded-full text-white text-[11px] font-bold`. First letter of name. Host=`bg-ember-deep`, participant=`bg-ink-soft`.

### Ember (Reputation) — Red/Orange/Gray 3-color (not simple on/off)
- Phosphor Fire icon **5 cells**. 20 points = 1 cell.
  - **Full cell = red** (`flame-red`)
  - **In-progress cell = orange** (`ember`)
  - **Empty cell = gray** (`ink-soft`, opacity 0.22)
- Example: 60 pts = Red Red Red Gray Gray / 70 pts = Red Red Red Orange Gray / 30 pts = Red Orange Gray Gray Gray
- **Frozen (<=10 pts):** Entire Ember dimmed (opacity 0.5) + warning. **Suspended (<=5 pts):** Login blocked.
- **"Learn more" link:** Opens Modal (QA accordion, 4 items):
  - How does Ember grow (open by default): Add firewood +2, host close +3
  - Can Ember decrease: Manners -1, broken promise -2, serious -3, no-show -5, cancel within 24h -1
  - Are reviews applied immediately: Applied after host closes reviews
  - Ember tiers: 20 pts = 1 cell, 0-100, tier descriptions

### Rankings (Ember Keepers)
- "This month's [city] Ember Keepers Fire" Top 3. Nickname + host count. Per city, per month.

### Badges ("My Badges", 3 types)
- Horizontal 3-column grid. Unearned: `opacity-45 grayscale`.
- **Display order (vertical):** Icon -> City name -> Badge name.
- **Section split:** "Current city badges" + "Other city badges".
- Medal [City] Pioneer / Heart [City] Sharer / Fork-knife [City] Foodie. Badge names include city name.
- **Pioneer wording:** Unified as "Completed / Completed by".

### Header & Navigation
- **Tab bar active:** `text-ink` (brown) + fill icon + `bg-ink/8`. Inactive: `text-ink-soft` + regular. Orange for FAB only.
- **Mobile header (fixed):** Left: flame symbol. Center: tagline (4s alternation, 500ms fade+up) + Pin city. Right: Bell.
- **Notification bell:** Unread shows red dot at top-right (`flame-red`).
- **NotificationsPage (`/notifications`):** Unread = `bg-paper2` + red dot. Click marks as read + navigates. Host handover includes "Accept" button.
- **Guest UI:** Header = Login button (instead of Bell). Tab bar = Login tab (instead of User). Click navigates directly to `/login`.
- **Desktop sidebar:** Flame symbol (top) -> Tab icons -> Bell notifications (bottom).

### Empty States
- **First resident:** Large flame symbol + "Fire You could be [city]'s first Ember" + share button (`bg-ember`).
- **Empty feed (Home Meal/Together):** 6 example cards (2x3 grid, `border-dashed` cards). Click opens create modal.
- **Local Eats/Profile empty feed:** Only hide filter chips (no example cards).
- Empty state tone: Not "nothing here yet" but "you can start this".

### Checkbox
- `accent-color: var(--color-ink-soft)` — global CSS (`index.css`).

### DateTimePicker
- Date (DatePicker) + Time (Dropdown) separated. Mobile: one per row. Uses react-datepicker.

### Modals
- **Modal (responsive):** Mobile = bottom sheet (`rounded-t-[20px] p-6`). Desktop = centered (`rounded-2xl p-6 max-w-[440px]`). Close with X icon.
- **ConfirmModal:** `rounded-2xl p-6 max-w-80`. Destructive confirm (cancel, etc.): `bg-flame-red`.
- **LowTurnoutModal:** ConfirmModal style. Title "Not enough people yet". Host only: "No one has joined yet" / With participants: "N people joined" (excluding host). [Cancel anyway] `bg-flame-red` / [Proceed regardless] `bg-ember`.
- **HandoverModal:** "Take over as host of [group name]?" Primary button `bg-ember`.
- **ReviewModal:** Auto popup on login for unreviewed completed meetups (excludes review_closed). "I'll do it later" permanently dismisses (localStorage). Closes immediately on submit.
- **ReviewSection (Host):** No-show collapsible card + add firewood box. Add = ember, remove = flame-red. "Complete Review" button (`bg-ember`) standalone below the box.
- **DetailPage:** `<- Go back` (CaretLeft, `text-ink-soft`).
  - Home Meal / Together: Host, date -> all reason tags -> description -> comments -> bottom sticky (avatars + capacity + action button).
  - Local Eats: Restaurant name -> author, location, map -> description -> likes.
- **AlertBanner:** Slide down, auto-close after 3s. success/waitlist/info types. Nickname duplicate error shown as absolute inline below input field.
- **Modal `action` prop:** Submit button as bottom sticky (safe-area-inset-bottom padding).

### Profile Page (MePage)
- Settings integrated into MePage.
- **Top:** Nickname (inline edit + Pencil, skip API if same nickname) + My city (suburb) dropdown.
  - Nickname duplicate error: absolute inline below input field.
  - Exclude is_demo cities. Suburb hint: "Selecting a suburb auto-fills it when creating posts".
- Ember card + Learn more
- Rankings -> Activity (MyActivity) -> Badges order
- **Logout:** At bottom, `text-flame-red`.
- **Terms link:** Below logout, `text-ink-soft text-[12px]` -> `/terms`.

---

## 6. Icons

- **Phosphor Icons** — centrally managed in `src/components/icons.js`.
- **Categories are distinguished by icons** (not colors).
- **Weight rules:**
  - Tab bar: active = `fill` + `text-ink`, inactive = `regular` + `text-ink-soft`
  - Filter chips: inactive = `regular`, active = `fill`
  - Card type icons: `regular` (ink color)
  - Inside action buttons: `fill`
  - Like (Heart): before press `regular`, after `fill` (flame yellow)
- **Icons in use:**
  - Tab bar: CookingPot (Home Meal), Handshake (Together), ForkKnife (Local Eats), User (Profile)
  - Home Meal types: ChefHat (Cook together), PuzzlePiece (Potluck), Heart (Share)
  - Together types: ForkKnife (Eat together), ShoppingCart (Buy together)
  - Common: MapPin, CalendarBlank, Clock, Users, Fire, Heart, CheckCircle, HourglassSimple, Info, X, Plus, Minus, Trophy, Bell, CaretDown, SignOut, Pencil, Trash, ChatCircle, CrownSimple, Copy, WarningCircle, Shrimp, CaretLeft

### Dropdown Component
- Custom dropdown (`createPortal` — renders correctly above modals).
- Style: `bg-card rounded-xl border border-line shadow-md`. Option hover: `bg-paper2`.

---

## 7. Page Taglines

| Page | Tagline | Description |
|------|---------|-------------|
| App (Header) | Don't eat alone, let's eat together | Alternates every 4s |
| Home Meal | Home-cooked meals taste better together | Share cooking with neighbors — no buying or selling |
| Together | When it's too much alone, do it together | That restaurant with big portions, that bulk buy... eat together, buy together |
| Local Eats | Find the best spots in our neighborhood | Liked it? Hit 'like'. Enough likes make it a neighborhood favorite Yellow-heart |
| Profile | The more Jeong you share, the brighter your Ember | Trust grows as Ember, activity lives on as rankings and badges |
| Terms (/terms) | (Title only) | Terms of Service + Privacy Policy. Accessible without login. No header/tab bar. |

---

## 8. Tone & Voice

- **Friendly, warm, conversational.** "When it's too much alone, do it together."
- Legal notices softened with parentheses: "(no buying or selling)".
- No punitive or threatening tone. "Sharing Jeong lights things up" — positive framing.
- Ember guidance: "Ember is trust. Share good times and it brightens; awkward encounters dim it."
- Cancel confirm: "Cancel your spot?" / "Got it, cancelled".
- Notifications use completion forms: "You've joined!" / "Added to waitlist!" / "Cancelled."
- **Create modal titles:**
  - Together: "Want to do it together?" / "What feels like too much alone becomes easy together"
  - Home Meal: "Home meal together?" / "When there's too much, too hard, or too boring — do it together"
  - Local Eats: "Share your favorite spot?" / "Even one recommendation can help someone"
- **Review description (ReviewModal):**
  - Participant: "Add firewood to someone you'd love to meet again. It grows their Ember. All reviews take effect after the host closes them."
  - Host no-show step: "Let us know if anyone didn't show up."
  - Host firewood step: "Add firewood to someone you'd love to meet again. It grows their Ember."
- **Action button text:**
  - Home Meal: "Let's cook together" (cook) / "Let's share" (share) / "Give it away" (free)
  - Together: "Let's do it"
- **PastItem status buttons:**
  - Leave review: `ink-soft` + underline
  - Close reviews (i): `bg-ember` (host only, enabled after **48 hours**)
  - Review complete: `herb` text
  - Ended: `ink-soft` text

---

## 9. Anti-Patterns (Never Do)

- No pure white background / black text (use cream + ink brown)
- No serif headlines (use sans-serif)
- No sharp rectangular buttons (use pill/rounded)
- No flame colors as full backgrounds (accent only)
- No category distinction by color (use icons)
- No same color for multiple meanings (color = one function)
- No ember overuse outside buttons (chips active = brown, tab active = brown, done = green)
- No new hover colors (use ember-deep, -translate-y-0.5, bg-transparent only)
- No binary on/off for Ember (use red/orange/gray 3-color progress)
- No heavy shadows / 3D effects (flat, paper feel)
- No dark mode
- No image-heavy layouts (use text, icons, Google Maps links)
- No same-size buttons/chips/tags (use size and fill for hierarchy)
- No `rounded-full` on buttons (large = `rounded-xl`, small = `rounded-lg`)
- No empty Pin icon when suburbName is missing (don't render if empty string)
- No visible filter chip scrollbars (use `hide-scrollbar` class)
- No like/join button size mismatch (both `py-2 text-[13px]`)
