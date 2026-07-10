# Dajeong — Product Spec / AI Prompt

> Complete product specification — features, data model, and design decisions.

---

## 0. Project Summary

**Dajeong** — A neighborhood community web app for Korean foodies in New Zealand and Australia to casually meet up, **visit restaurants together, do group buys, and share home-cooked meals**. Mobile-first responsive (desktop: sidebar).

Core value: **"Do together what's too much to do alone."**

---

## 1. Tech Stack

- **Frontend:** React (Vite) + functional components + Hooks + React Query (TanStack Query)
- **Styling:** Tailwind CSS v4 (custom tokens via `@theme` in `index.css`)
- **Icons:** Phosphor Icons (`@phosphor-icons/react`) — regular/fill only. Centrally managed in `src/components/icons.js`.
- **Backend:** Supabase (Auth + Postgres + RLS) — portfolio demo uses mock data
- **Hosting:** GitHub Pages (portfolio demo)

---

## 2. Design Tokens (Logo-Based)

Defined via Tailwind `@theme` in `index.css`:

```css
@theme {
  /* Logo's 3 colors form the core: flame-red (body) / flame (heart) / ink (text) */
  --color-paper: #f6efe2;       /* Warm cream (main background) */
  --color-paper2: #fbf6ec;      /* Light cream (tab bar, etc.) */
  --color-card: #fffdf8;        /* Card background */
  --color-ink: #4f1f0a;         /* Ink brown (logo text color, main text) */
  --color-ink-soft: #8a6b52;    /* Secondary text */
  --color-flame: #feb700;       /* Jeong flame yellow (logo heart, accent/highlight) */
  --color-flame-red: #960100;   /* Flame red (logo body, full Ember cells) */
  --color-ember: #f57c1a;       /* Orange (primary buttons / Ember progress cells) */
  --color-ember-deep: #d9601a;  /* Deep orange (avatars / accent) */
  --color-herb: #6f8f54;        /* Action green (completed/success) */
  --color-line: rgba(79, 31, 10, 0.12);  /* Borders (ink brown 12%) */
}
```
- Primary button (ember #f57c1a) text is **white** (700 bold).
- **Font:** Pretendard Variable (sans-serif, optimized for Korean). Logo is a separate SVG image.
- **Color is for "function" only; categories are distinguished by icons** (DESIGN.md section 1).
- **Rounded corners:** Cards `rounded-2xl`, chips/tags `rounded-full`, large buttons (ember) `rounded-xl`, small buttons (ink/card) `rounded-lg py-2`.

---

## 3. Brand

- Name: Dajeong — from Korean "Jeong (情)", sharing warmth through food
- Logo: SVG (`src/assets/logo.svg`) — flame symbol (red body + yellow heart) + "Dajeong" text (ink brown)
- Flame symbol: SVG (`src/assets/symbol.svg`) — desktop sidebar top
- App icon/favicon: PNG (`public/favicon.png`, `public/icon-192.png`) — yellow background + flame symbol
- Tagline: "Don't eat alone, let's eat together"

---

## 4. Core Features (4 Tabs)

### Header (Mobile) — 3-section, fixed

```
[Flame symbol]      Pin [City] Caret-down      Bell Notifications
 (left, brand)       (center)                   (right, unread red dot)
```
- Center (2 lines): Top = alternating tagline ("Don't eat alone" <-> "Let's eat together", every 4s with 500ms fade+up transition). Bottom = current city (Pin + city name + CaretDown). Tap to **browse other cities** (doesn't change membership).
- **City click -> Browse modal:**
  - Country toggle at top (NZ Flag NZ / AU Flag AU).
  - City warmth descriptions: Quiet town (0) -> Warming up (1-9) -> Warm town (10-29) -> Active town (30-99) -> Hot town (100+).
  - Logged-in users: "Move here" button next to each city. **is_demo=true cities have no "Move here" button**.
  - Browsing banner: Logged-in "Browsing Christchurch - Return to my city" / Guest "Browsing Christchurch - Log in".
  - FAB/join buttons hidden.

### Tab Structure

| Order | Icon | Tab Name | Description |
|-------|------|----------|-------------|
| 1 | CookingPot | **Home Meal** (default landing) | Cook together / Potluck / Share |
| 2 | Handshake | **Together** | Eat together / Buy together |
| 3 | ForkKnife | **Local Eats** | Share recommendations |
| 4 | User | **Profile** | Ember + Rankings + Badges + Settings |

- Mobile: bottom tab bar with 4 tabs. Desktop (md+): left sidebar (flame symbol + tabs + Bell at bottom).

### Route Structure

- Feeds: `/:country/:city/homemeal`, `/:country/:city/together`, `/:country/:city/reco`
- Detail (DetailPage): `/:country/:city/homemeal/:slug`, `/:country/:city/together/:slug`, `/:country/:city/reco/:slug`
- Other: `/me`, `/notifications`, `/login`, `/terms`
- `basePath`: computed in auth context (logged-in = profile city, guest = viewCityId).

### 4-0. Notifications (`/notifications`)

- Accessed via mobile header bell / desktop sidebar bottom bell.
- Unread notifications: `bg-paper2` background + red dot. Click marks as read and navigates to the post.
- Notification types: join/cancel/delete/like/host handover offer/waitlist auto-promotion/Home Meal address reveal/low turnout, etc.
- Notification API: `createNotification()`, `notifyHost()`, `notifyParticipants()`.
- Empty state: "No notifications yet".

### 4-1. Home Meal (homemeal) — Default Tab

- Type filter: All / Cook together (cook) / Share (potluck) / Free (share). Only types with data shown; if only 1 type, hide chips.
  - **Cook together** (ChefHat): Group cooking (dumplings, kimchi-making, BBQ, etc.).
  - **Share** (PuzzlePiece): Each person brings a dish to swap.
  - **Free** (Gift): Free giveaway.
- **Card layout:**
  - Row 1: Date / comment count (ChatCircle + N, right) | Host name + Ember (right)
  - Row 2: Host avatar (`bg-ember-deep`) + participant avatars (max 3, `bg-ink-soft`, +N) + count | Status badge (right)
  - Avatar overlap: `-space-x-1.5`, higher z-index on left.
  - If suburbName is empty string, don't render MapPin + location.
- **No action buttons on cards** — status badges only (Joined/Waitlisted/My group). Join/cancel on DetailPage only.
- **Action buttons (DetailPage):** "Let's cook together" (cook) / "Let's share" (potluck) / "Get it free" (share) / When full: "Clock Join waitlist". After joining: "Check Joined" / "Hourglass Waitlisted" (cancel via ConfirmModal).
- **Join confirmation AlertBanner:** For Home Meals with address: "You've joined! Bento-box The exact address will be shared 24 hours before the meetup".
- **Capacity display (Home Meal / Together / MyActivity shared):**
  - capacity null (unlimited): "N joined".
  - capacity set: "N/M". 1 spot left: `- Last spot!`. Full: `[Full]` badge (gray) before title + card dimmed.
  - Count includes host (host is also in participants).
- **Waitlist:** When full, joins go to waitlist. When someone cancels, next waitlisted is auto-promoted (`promoteNextWaitlist`) + notification.
- **Cook vote (Home Meal reviews only):** "Whose cooking was the best?" Pick 1 person (optional). Recorded in cook_votes table. Currently data-only, not displayed.
- **Comments section (DetailPage):** Avatar (host=`bg-ember-deep`, participant=`bg-ink-soft`) + nickname + time + content. Edit within 15 min only. Delete by author only. Report: WarningCircle button on others' comments -> ReportModal. Comment input maxLength 200. 5 comments per page (PAGE_SIZE=5), fetched newest-first then reversed on screen (chat order), "Load earlier comments" at top.
- Subtitle: "Share cooking with your neighbors — no buying or selling."
- FAB: Mobile full-width bar "+ Start a Home Meal" / Desktop bottom-right icon.
- **Empty feed:** 6 example cards (2x3 grid, dashed border). Click opens create modal.

### 4-2. Together

- Type filter: All / Eat together (go) / Buy together (buy). Only types with data shown; if only 1 type, hide chips.
- **Card layout:** Same as Home Meal (date, comments, host, avatars, capacity, status badges).
- **Capacity display:** Same rules as Home Meal (section 4-1).
- **Waitlist:** When full, joins go to waitlist. Auto-promotion on cancellation.
- **Low turnout cancellation (no penalty):** If host set min_capacity and it's not met 12-24h before, LowTurnoutModal auto-pops on host login. [Proceed] / [Cancel anyway] options.
- **No action buttons on cards** — DetailPage only.
- **Action buttons (DetailPage):** "Let's do it" / When full: "Clock Join waitlist". After joining: "Check Joined" / "Hourglass Waitlisted".
- **Tags** (reasons) — label purpose (max 2 on card, all on DetailPage):
  - Eat together: Fork-knife Big portions / Plate Sharing variety / See-no-evil Awkward alone / Ticket Discount reservation
  - Buy together: Tag Group deal / Box Bulk buy / Scissors Split purchase
  - Custom input allowed (max 20 chars, Korean IME isComposing check).
- **Address display:** If starts with http, show "View map" link (`text-ember-deep underline`), otherwise CopyableAddress component (hover shows Copy icon, click copies + "Copied" feedback), hidden if empty.
- **Comments section:** Same rules as Home Meal (section 4-1).
- FAB: Mobile full-width bar "Find people to join" / Desktop bottom-right icon.
- **Empty feed:** 6 example cards (2x3 grid, dashed border):
  1. **Pizza & Pasta** (ForkKnife, "Sharing variety")
  2. **No More Solo Dining** (ForkKnife, "Awkward alone")
  3. **Condiment Cartel** (Shrimp, "Group order from Korea")
  4. **Discount Deal** (ForkKnife, "Discount reservation")
  5. **Dim Sum** (ForkKnife, "Sharing variety")
  6. **Grocery Buddy** (ShoppingCart, "Split purchase")

### 4-3. Local Eats (reco)

- Category filter: Korean / Asian / Cafe & Brunch / Western / Dessert & Bakery / Other. Only categories with data shown; if only 1, hide chips.
- **Card layout:**
  - Title row: `[Category tag] Restaurant name`.
  - Body: One-line review.
  - Bottom: `Yellow-heart N / [Author nickname] recommends / Pin Map` (if author has Foodie badge: `"Fork-knife Junho recommends"` format with icon).
  - Like (Heart) button: Fixed right of card. Before press `regular`, after `fill` (flame yellow).
  - Author sees edit (Pencil) icon at top right.
- **Unlike:** Re-click to undo immediately (no ConfirmModal). AlertBanner `"Like removed."`.
- **agree_count:** Auto-synced via `sync_agree_count` DB trigger (no manual update needed).
- **Popular Local Eats (top 3):** Top of feed "Yellow-heart Our neighborhood's top Local Eats" (1+ agrees, cumulative top 3, yellow glow). Rest sorted by likes.
- FAB: Mobile full-width bar "Recommend a spot" / Desktop bottom-right icon.
- **Empty feed:** Only hide filter chips (no example cards).

### 4-4. Create Flow

FAB click -> create form Modal (mobile = bottom sheet, desktop = centered modal).

**Create guards:**
- Guest: Show login modal.
- Browsing another city: "You can only create in your own city" AlertBanner.

**Submit button disabled:** `bg-ink/20 text-ink-soft cursor-not-allowed` when required fields are empty.

**(A) Create Together** — `meetings`
> Modal title: **"Want to do it together?"** / Subtitle: "What feels like too much alone becomes easy together"

1. **Type** (required): Fork-knife Eat together (go) / Cart Buy together (buy)
2. **Title** (required, 50 chars): placeholder varies by type
3. **Description** (required): Why you want to do it together
4. **Suburb** (required): Dropdown. Auto-fills from profile suburb_id if set. Otherwise "+ Request suburb".
5. **Address** (optional): "Google Maps link or address". If starts with http, treated as map link; otherwise address text.
6. **Date & time** (required): Date (DatePicker) + Time (Dropdown). Mobile: one per row.
7. **Estimated cost** (optional)
8. **Capacity**: "Set a limit" checkbox -> `Min [ N ] ~ Max [ N ] people` (including yourself). Unchecked = unlimited.
9. **Tags** (optional): Presets + custom input (max 20 chars).

**(B) Create Home Meal** — `homemeals`
> Modal title: **"Home meal together?"** / Subtitle: "When there's too much, too hard, or too boring — do it together"

1. **Type** (required): Chef-hat Cook together (cook) / Puzzle Share (potluck) / Gift Free (share)
2. **Title** (required, 50 chars)
3. **Description** (required)
4. **Suburb** (required, dropdown, auto-fills). **Address** (optional): Only revealed to confirmed attendees within 24h. Before: "Pin Detailed location will be revealed 24 hours before".
5. **Date & time** (required)
6. **Estimated ingredient cost** (optional, cook/share only)
7. **Capacity**: "Set a limit" checkbox -> `Min [ N ] ~ Max [ N ] people`. Unchecked = unlimited.

Fixed notice: "(no buying or selling)".

**(C) Create Local Eats** — `recos`
> Modal title: **"Share your favorite spot?"** / Subtitle: "Even one recommendation can help someone"

1. **Restaurant name** (required)
2. **Category** (required): Korean / Asian / Cafe & Brunch / Western / Dessert & Bakery / Other
3. **Suburb** (required, auto-fills)
4. **One-line review** (required, 100 chars)
5. **Google Maps link** (optional)

**Common principles:**
- All creations belong to user's home city.
- No image upload.
- Frozen (<=10 pts) users cannot host Together events.
- **2-hour overlap check:** On create/join, warn if within 2 hours of existing event. Bidirectional between meetings and homemeals. `checkTimeOverlap` utility. Excludes cancelled/completed events.
- **Duplicate submission prevention:** `isPending` check blocks resubmission.
- **Input length limits:** Title 50 chars, description 300 chars, review 100 chars, suburb 30 chars. Counter shown in input, blocked by maxLength.
- **Date format:** `Sat, Jun 28 6:30pm` (CalendarBlank icon). `formatDate` utility.
- **Editing:** Together/Home Meal: all fields. Local Eats: review, Google Maps link, suburb only (name/category disabled).

---

### 4-5. Profile (me)

**Ember (Trust, 0-100, new users start at 30):**
- Fire icon 5 cells. Red (full) / Orange (in-progress) / Gray (empty). 20 pts = 1 cell.
- "Ember is **trust**. Share good times and it brightens; awkward encounters dim it."
- **"Learn more" link** -> Modal (QA accordion, 4 items): How to earn / Penalty reasons / When applied / Tier descriptions. First item open by default.

**Ember Keepers Rankings (Activity):**
- Completed event host count, per city per month. "This month's [city] Ember Keepers Fire" top 3.

**Current Activity (MyActivity):**
- Filter chips: All / My Groups / Joined / Waitlisted (4 chips). Default 3 + show more.
- Waitlisted card: HourglassSimple + "Waitlisted" (flame color).
- Past card: Category + title + badge. Hosted events show "My group" badge (`text-ember`). Unreviewed shows "Leave review" button.
- Delete: If no participants, delete immediately. If participants (excluding host), offer handover.
- Delete method: meetings/homemeals use `cancelled=true` + `deleted_at` timestamp (soft delete). recos/comments use `deleted_at` timestamp (soft delete).

**Badges ("My Badges"):**
- Horizontal 3-column grid. Unearned: `opacity-45 grayscale`.
- Medal **[City] Pioneer** — First person to complete a meetup in that city. Unified wording: "Completed / Completed by".
- Heart **[City] Sharer** — 5 Home Meal shares.
- Fork-knife **[City] Foodie** — One of your Local Eats reaches 100 likes.
- "Current city badges" + "Other city badges" section split.

**Profile Page Structure:**
- Top: Nickname (inline edit + Pencil), my city (suburb) dropdown (country -> city -> suburb).
  - **Nickname duplicate error:** Absolute inline below input field.
  - City display order: "Albany, Auckland, New Zealand". Exclude is_demo cities.
  - Hint: "Selecting a suburb auto-fills it when creating posts".
- Ember card + Learn more
- Rankings -> Activity -> Badges order
- Bottom: Logout button (`text-flame-red`), Terms link (`/terms`, `text-ink-soft text-[12px]`).

---

## 5. Ember Score System

### Score Changes (0-100, new users start at 30)

| Action | Points |
|--------|--------|
| Add firewood (positive review) | **+2** (capped per event) |
| Host closes reviews | **+3** |
| No-show | **-5** |
| Remove: Manners | **-1** |
| Remove: Broken promise | **-2** |
| Remove: Serious | **-3** |

> **Review close rules:** **48 hours** after event ends, host's "Close Reviews" button activates. On close, applied all at once: completed=true, review_closed=true, host +3, majority vote applied per participant. Close is one-time only.
> **Host is included in participants:** On creation, host is auto-inserted into meeting_participants/homemeal_participants (status='joined'). Capacity count uses participant row count.
> All score changes are recorded in the reviews table.

### Cancellation Policy

| Situation | Penalty |
|-----------|---------|
| Cancel when waitlisted people exist | **0** |
| Cancel 24+ hours before | **0** |
| Cancel within 24 hours (no waitlist) | **-1** |
| No-show | **-5** |

### Host Handover

1. If host can't attend, a public offer notification is sent to participants. Frozen (<=10 pts) users excluded.
2. First to accept = new host. Original host removed from participants. Address reset. Participants notified "Host has changed".
3. If no one accepts + cancellation within 24h -> original host **-5**.

> **Low turnout cancellation has no penalty** (not host's fault).

### Ember Tiers (20 pts = 1 cell)
```
0-20  -> 1 cell   21-40 -> 2 cells (new users at 30 pts)
41-60 -> 3 cells  61-80 -> 4 cells  81-100 -> 5 cells
```

### Color Logic (Not Simple On/Off)
- **Full cell = red** (`flame-red`), **in-progress cell = orange** (`ember`), **empty cell = gray** (`ink-soft`, opacity 0.22).
- Example: 60 pts = Red Red Red Gray Gray / 70 pts = Red Red Red Orange Gray / 30 pts = Red Orange Gray Gray Gray

### Frozen & Suspended
- **10 pts or below = Frozen**: Cannot host events + warning. Ember dimmed.
- **5 pts or below = Suspended**: Login blocked.

### Reviews (ReviewModal)

- Auto popup on login for unreviewed completed events (excludes review_closed events). "I'll do it later" permanently dismisses (localStorage).
- Also accessible via profile past card "Leave review" button.
- **3-step flow (single submission):**
  1. **No-show check (host only):** Select absent members.
  2. **Add firewood:** Click name tags to activate (ember color). "Select all" button.
  3. **Remove firewood (optional):** Select target + CaretDown for reason (Manners -1 / Broken promise -2 / Serious -3).
  4. **Cook vote (Home Meal only):** Pick 1 person, optional.
- Single "Complete Review" submit button. Closes immediately on submit.
- Scores applied in batch after host closes reviews.

### Badge Criteria

| Badge | Criteria |
|-------|----------|
| Medal [City] Pioneer | First completed meetup in that city (when cities.pioneer_id is null) |
| Heart [City] Sharer | 5 Home Meal shares |
| Fork-knife [City] Foodie | One of your Local Eats reaches 100 likes |

---

## 6. Shared UI Components

- **Infinite scroll:** `useInfiniteQuery` + `useInfiniteScrollObserver`. Loads 10 at a time. Comments load 5 (PAGE_SIZE=5).
- **Card**: `bg-card rounded-2xl border border-line`. Status badge display. Click -> DetailPage.
- **DetailPage**: Full page. Card background, `<- Go back`. Action buttons on DetailPage only.
- **Chip**: Filter/selection chip (`rounded-full`, active: ink background)
- **Fab**: Mobile full-width bar (`bg-ember rounded-[14px]`) / Desktop bottom-right (`bg-ember`)
- **Modal**: Mobile = bottom sheet (`rounded-t-[20px]`) / Desktop = centered (`rounded-2xl max-w-[440px]`)
- **ConfirmModal**: Cancel confirmation centered modal. Destructive confirm uses `bg-flame-red`.
- **LowTurnoutModal**: Low turnout cancel confirmation. Title "Not enough people yet". Auto-pops on host login.
- **AlertBanner**: Top slide-down (success/waitlist/info, auto-close 3s).
- **HandoverModal**: Host handover acceptance confirmation.
- **ReviewModal**: Completed event review. Home Meal includes cook vote.
- **Dropdown**: `createPortal` for rendering above modals. SuburbSelect also uses this.
- **CopyableAddress**: Address text. Hover shows Copy icon, click copies.
- **FlameGauge**: Flame SVG gauge (sway/pulse/spark animations)
- **MyActivity**: Filter All/My Groups/Joined/Waitlisted. Default 3 + show more.
- **MeetingForm / HomemealForm / RecoForm**: Create + edit modal reuse (`src/components/forms/`).
- **InputWithCounter**: Input + character counter (`N/300`)
- **NotFoundPage**: For missing URLs/posts: "Looks like you're lost".
- **TermsPage** (`/terms`): Terms of Service + Privacy Policy. Accessible without login.
- **ReportModal**: Comment report (`targetType="comment"`). WarningCircle icon on others' comments only.
- **usePageTitle hook**: Per-page browser tab title.

---

## 7. Authentication / Sign-Up

- **Email + password** authentication. Portfolio demo uses mock auth (auto-login as demo user).
- Sign-up flow: Email sign-up -> immediate login -> country -> city selection (CitySelectPage) -> feed.
- **Nickname duplicate check:** `checkNickname(nickname, userId?)` API. If duplicate, shown inline below input field.
- **AuthPage footer:** "By signing up, you agree to our Terms of Service and Privacy Policy" (`/terms` link, `text-ink-soft text-[11.5px]`).

### 7-1. City = Pool System

Users select a city on sign-up to join that city's pool. Feed shows only that city's content.

- **City list:** NZ/AU major cities seeded. "My city isn't listed?" button -> stored in city_requests table.
- **City active check:** `c.member_count > 0 || c.id === myCityId` condition (cities.active column unused).
- **First resident message:** "Fire You could be [city]'s first Ember. It gets warmer with friends." + share button. Share link: `https://domain/:country/:city/homemeal`.
- **Header Pin City Caret = view switch** (doesn't change membership). **Profile > city change = actual move**.
- **On city move:** Ember and badges carry over. Rankings start fresh in new city. Events and Local Eats stay in original city.
- **is_demo=true cities:** Excluded from move/city selection. Still visible in browse/feed.

### 7-2. Guest Browse Mode

- Login page bottom: "Browse first without signing up" + city buttons (cities with `member_count > 0` only).
- City click -> navigate to `/:country/:city/homemeal`. Guest mode activated.
- Direct URL access (shared links) auto-enters guest mode.
- **Guest UI:** Header = Login button (instead of Bell). Tab bar = Login tab (instead of Profile). Click navigates directly to `/login`.

---

## 8. Data Model

```
cities        — id, name, name_ko, country('NZ'|'AU'), active(bool — unused, member_count determines active),
                member_count(realtime count via profiles join), pioneer_id, is_demo(bool, default false), created_at
                * is_demo=true excluded from move/city selection. Visible in browse/feed.
                * Sort: member_count DESC, name ASC.

suburbs       — id, city_id(->cities), name, name_ko, created_at

profiles      — id, nickname, city_id(->cities), suburb_id(->suburbs), flame_score(default 30), cook_score(default 0), created_at
                * country derived from city_id -> cities.country FK.
                * cook_score: cumulative cook vote count. Not currently displayed.

meetings      — id, slug(unique), kind('go'|'buy'), title, description, city_id, suburb_id, address(nullable),
                meet_at, capacity(nullable — null=unlimited), min_capacity, budget(nullable),
                flexible(kept in DB, unused), host_id, reasons(text[]),
                completed(bool), review_closed(bool), handover(bool), cancelled(bool), deleted_at(timestamptz nullable),
                comment_count(auto-synced via sync_comment_count trigger), created_at, updated_at
                * cancelled=true + deleted_at timestamp (soft delete). Feed queries filter cancelled=false.

meeting_participants — id, meeting_id, user_id, status('joined'|'waitlist'), created_at

homemeals     — id, slug(unique), kind('cook'|'potluck'|'share'), title, description, city_id, suburb_id, address(nullable),
                share_at, capacity(nullable), min_capacity, budget(nullable),
                flexible(kept in DB, unused), host_id, completed(bool), review_closed(bool), cancelled(bool), deleted_at(timestamptz nullable),
                comment_count(auto-synced), created_at, updated_at
                * cancelled=true + deleted_at timestamp (soft delete). Feed queries filter cancelled=false.
                * Home Meal address not included in list queries. Provided only via get_homemeal_address RPC
                  (requires joined status + within 24h of share_at).

homemeal_participants — id, homemeal_id, user_id, status('joined'|'waitlist'), created_at

recos         — id, slug(unique), name, category, city_id, suburb_id, note, map_url, author_id, agree_count, created_at, deleted_at(timestamptz nullable)
                * deleted_at soft delete. Records timestamp instead of actual DELETE. fetchRecos filters with .is("deleted_at", null).

reco_agrees   — id, reco_id, user_id

reviews       — id, meeting_id(nullable), homemeal_id(nullable), from_id(nullable), to_id,
                type('plus'|'minus'|'host_bonus'|'cancel_penalty'|'noshow_penalty'), points, created_at
                * from_id null = system record. CHECK: num_nonnulls(meeting_id, homemeal_id) = 1.

cook_votes    — id, homemeal_id, voter_id, voted_for, created_at
                * UNIQUE(homemeal_id, voter_id). On close, vote count added to cook_score.

cancellations — id, meeting_id(nullable), homemeal_id(nullable), user_id, hours_before, penalty, created_at

badges        — id, user_id, city_id, badge_type('pioneer'|'sharer'|'foodie'), earned_at
                * Stored per city. Persists across city moves.

host_stats    — id, user_id, city_id, month, hosted_count

comments      — id, meeting_id(nullable), homemeal_id(nullable), user_id, content(maxLength 200), created_at, updated_at, deleted_at(timestamptz nullable)
                * meeting_id / homemeal_id: only one non-null. Edit within 15 min (app logic).
                * deleted_at soft delete. Records timestamp instead of actual DELETE. fetchComments filters with .is("deleted_at", null).

notifications — id, user_id, type, meeting_id, message, read(bool), created_at

city_requests — id, requested_name, country, kind('city'|'suburb'), city_id(for suburb requests), user_id, created_at

activity_logs — id, user_id, action(text), target_type(text), target_id(text), details(jsonb), created_at
                * Migration 018. Core action logs. Currently used for: closeReviews(action='review_closed'), submitReport(action='report').
                * logActivity utility for core action logging.
```

**DB Triggers & RPCs:**
- `sync_agree_count` — Auto-syncs agree_count on reco_agrees changes.
- `sync_comment_count` — Auto-syncs comment_count on comments changes.
- `set_updated_at` — Auto-updates updated_at.
- `promoteNextWaitlist` — Auto-promotes next waitlisted person on cancellation + notification.
- `adjust_flame_score` RPC — Ember score adjustment.
- `increment_host_stat` RPC — Host stats increment.
- `get_homemeal_address` SECURITY DEFINER RPC — Conditional Home Meal address access.

**Input length limits (DB CHECK):** title 50 chars, description 300 chars, note 100 chars, content 200 chars, nickname 20 chars.

**RLS (Migration 017):**
- comments edit/delete: owner (user_id) only.
- meetings/homemeals edit: host (host_id) only.
- recos edit: author (author_id) only.
- reviews insert: from_id = auth.uid() or from_id IS NULL (system).

**Comment 15-min edit limit:** Checked on both frontend and API. `updateComment` verifies created_at -> returns error if over 15 min.

**closeReviews host check:** `auth.getUser()` verifies requester is host before proceeding.

---

## 9. Operating Principles

1. **No monetary transactions between users** — no payment features.
2. **Home Meals are not for buying/selling/trading** — NZ Food Act compliance.
3. **Minimal images** — Google Maps links, Phosphor icons, text-driven.
4. **Platform is a tool** — users host everything. No operator involvement needed.
5. **Keep it simple** — MVP: Home Meal + Together + Local Eats.
6. **Security:**
   - XSS prevention: React auto-escaping + `safeHref()` (http/https only).
   - Input length: DB CHECK constraints.
   - Home Meal address protection: `get_homemeal_address` RPC.
   - Enhanced RLS: comment edit/delete owner-only, event edit host-only, Local Eats edit author-only, reviews insert self or system.
   - Core action logging: `activity_logs` table + `logActivity` utility.

---

## 10. Development Priority

**Completed features:**
- Home Meal / Together / Local Eats / Profile — full functionality
- Email sign-up/login
- City selection/switching + pool isolation
- Notification system
- Comments (15-min edit, reporting)
- Infinite scroll
- React Query migration
- Guest browse mode
- DetailPage transition (DetailModal removed)
- Card status badges
- Waitlist auto-promotion
- Ember score / review close system
- Cook votes (cook_votes)
- Nickname duplicate check
- Host handover
- Badges (Pioneer / Sharer / Foodie)
- Rankings aggregation
- Low turnout cancellation (LowTurnoutModal)
- Home Meal address server protection
- Slug-based URLs
- is_demo city flag
- 404 page, page titles

**Future considerations:**
- [ ] Suburb filter
- [ ] Multi-city / multi-country expansion
- [ ] Content reporting feature
- [ ] Native mobile app

---

## 11. Initial Scope

- **Region:** City-level pool isolation. NZ/AU major cities seeded.
