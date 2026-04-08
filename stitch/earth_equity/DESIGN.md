# Design System Strategy: The Botanical Ledger

## 1. Overview & Creative North Star
The visual identity of this design system is guided by the Creative North Star: **"The Botanical Ledger."** 

This system rejects the sterile, "SaaS-blue" aesthetics of traditional fintech in favor of a sophisticated, editorial atmosphere. It is designed to feel like a high-end, bespoke investment report—precise, authoritative, and rooted in the earth. We achieve this by blending high-density financial data with organic tonal shifts. Instead of rigid boxes and heavy borders, the interface breathes through intentional asymmetry and a "stacked paper" layout philosophy, signaling both ecological stewardship and institutional-grade stability.

---

## 2. Colors & Surface Philosophy
The palette utilizes deep forest greens and warm parchment to establish a sense of history and "old-money" reliability, updated for a modern renewable energy context.

### The "No-Line" Rule
To maintain a premium, editorial feel, **1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined exclusively through background color shifts. A section should be distinguished from its neighbor by moving from `surface` (#fffcca) to `surface-container-low` (#f9f6bf) or `surface-container-high` (#eeebb4).

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine, heavy-weight paper.
*   **Base Layer:** `surface` (#fffcca) for the global background.
*   **Primary Containers:** `surface-container-low` (#f9f6bf) for large content blocks.
*   **Nested Elements:** `surface-container-lowest` (#ffffff) for white "card" elements that need to pop against the parchment background.
*   **High Importance:** `surface-container-highest` (#e8e5af) for sidebars or utility panels that require distinct separation.

### The "Glass & Gradient" Rule
To add a signature polish, use **Glassmorphism** for floating navigational elements or top-level modals. Use `surface_bright` with a 70% opacity and a `20px` backdrop-blur. 
*   **Signature Textures:** For primary CTAs and hero data visualizations, apply a subtle linear gradient from `primary` (#244a3e) to `primary_container` (#3c6255) at a 135-degree angle to provide "soul" and depth.

---

## 3. Typography
We use **Manrope** across all scales. Its geometric yet slightly condensed nature provides the "Modern Professional" feel required for financial density.

*   **Display (lg/md/sm):** Used sparingly for high-level portfolio totals. These should feel like "monumental" numbers. Use a `-0.02em` letter spacing to keep them feeling tight and authoritative.
*   **Headline & Title:** Used for section headers. Always use `on_surface` (#1d1d00). The contrast between the dark green-black text and the parchment background is the primary driver of readability.
*   **Body (lg/md/sm):** The workhorse for data. Maintain a generous line height (1.5x) even in high-density layouts to ensure the parchment background isn't overwhelmed by "ink."
*   **Labels:** For table headers and captions, use `label-md` in all-caps with a `0.05em` letter spacing. This mimics editorial footnotes and adds an air of meticulousness.

---

## 4. Elevation & Depth
In this system, depth is a result of **Tonal Layering**, not structural shadows.

*   **The Layering Principle:** Avoid the "floating box" look. Instead, achieve lift by stacking surface tiers. For example, a `surface-container-lowest` card placed atop a `surface-container-low` section creates a natural, soft lift.
*   **Ambient Shadows:** Where a floating effect is necessary (e.g., a dropdown or a primary action modal), use an ultra-diffused shadow. 
    *   *Shadow Spec:* `0px 12px 32px rgba(29, 29, 0, 0.06)`. The shadow color is a tinted version of `on_surface`, not a neutral grey.
*   **The "Ghost Border":** If a border is required for accessibility in complex data tables, use the `outline_variant` token at **15% opacity**. This creates a "suggestion" of a line without breaking the editorial flow.

---

## 5. Components

### Buttons
*   **Primary:** Solid `primary` (#244a3e) with `on_primary` (#ffffff) text. Use `lg` (8px) roundness.
*   **Secondary:** `secondary_container` (#c0eacc) background with `on_secondary_container` (#466b53) text. No border.
*   **Tertiary:** No background. Use `primary` (#244a3e) text with a subtle underline on hover.

### High-Density Data Tables
*   **Rule:** Forbid divider lines.
*   **Implementation:** Use alternating row fills with `surface-container-low` and `surface`. Use `label-sm` for column headers with 60% opacity of `on_surface_variant`. 
*   **Alignment:** Numbers are always tabular-lining (monospaced) for easy vertical scanning of financial figures.

### Investment "Growth" Chips
*   Use `tertiary_fixed` (#d4eab9) as the background for positive growth metrics to signify "Eco-Healthy" returns. Text should be `on_tertiary_fixed_variant` (#3a4c28).

### Input Fields
*   Background: `surface_container_highest` (#e8e5af).
*   Border: None, except for a 2px bottom-accent in `primary` (#244a3e) when focused. This creates a "form-entry" feel typical of high-end ledger books.

### Cards
*   Cards should not have shadows by default. Use a background of `surface-container-lowest` (#ffffff) and a padding of `1.5rem` (24px) to create internal breathing room within the parchment-colored layout.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical margins. For example, a left-hand sidebar can be significantly wider than a right-hand utility bar to create an editorial layout.
*   **Do** use whitespace as a functional tool. If two data points are unrelated, increase the vertical gap rather than adding a line.
*   **Do** use the `accent` (Moss Green) for "Environment-Positive" indicators and `error` (#ba1a1a) sparingly for financial risk.

### Don't
*   **Don't** use pure black (#000000) or pure white (#FFFFFF) unless it is for a nested card background (`surface-container-lowest`).
*   **Don't** use standard 1px borders. This immediately cheapens the "Botanical Ledger" feel and makes the dashboard look like a generic template.
*   **Don't** use "Drop Shadows" on cards. Rely on color-blocking and tonal transitions.
*   **Don't** use rounded corners larger than `xl` (12px) or smaller than `sm` (2px). The `lg` (8px) setting is the system's "sweet spot" for professional warmth.