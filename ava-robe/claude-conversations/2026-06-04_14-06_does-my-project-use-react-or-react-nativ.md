# does my project use react or react native?

**Date:** 2026-06-04T12:06:42.447Z
**Session ID:** `ea1419bc-9549-43e6-b3a3-30218b00226f`

---

## User

does my project use react or react native?

## Assistant

_(tool: Read)_

## Assistant

Your project uses **React Native** (specifically via the **Expo** framework, version ~54).

Key indicators:
- `react-native` 0.81.5 and `expo` ~54 are the core dependencies
- Entry point is `expo-router/entry` (Expo's file-based router)
- Scripts target `android`, `ios`, and `web` via `expo start`
- It also pulls in `react-native-web` so it can run in the browser, plus `@react-three/fiber` + `three` for 3D rendering

So it's a React Native app (using React 19 under the hood), not a plain React web app.

## User

kan je asutjeblijft mijn moscow analyse aanpasen als je zie in de must have als er is iets dat ik niet heb doe die weg aub

## Assistant

_(tool: Bash)_

## Assistant

_(tool: Bash)_

## Assistant

_(tool: Bash)_

## Assistant

_(tool: Grep)_

## Assistant

_(tool: Grep)_

## Assistant

Laat me eerst even controleren of er een document bestand is van je MoSCoW analyse:

## Assistant

_(tool: Bash)_

## Assistant

_(tool: Bash)_

## User

[Request interrupted by user for tool use]

## User

kijk in de foto ik heb jou gestuurd de mascow analyze

## Assistant

Op basis van wat ik in je project heb gecontroleerd, dit is wat ik vond voor de **MUST HAVE** lijst:

| Must Have item | In project? |
|---|---|
| 3D-avatar om jezelf te maken | ✅ Ja ([avatar.tsx](app/avatar.tsx)) |
| Digitale kledingkast | ✅ Ja ([wardrobe.tsx](app/(tabs)/wardrobe.tsx)) |
| Impact tonen | ✅ Ja (CO₂/water in [clothing-detail.tsx](app/clothing-detail.tsx)) |
| Recycle Center | ✅ Ja ([recycle.tsx](app/(tabs)/recycle.tsx)) |
| **Puntensysteem en levels** | ❌ **Nee — niet gevonden** |
| Profiel en data opslaan | ✅ Ja ([profile.tsx](app/(tabs)/profile.tsx), [login.tsx](app/login.tsx), [signup.tsx](app/signup.tsx)) |

**Aanbeveling:** verwijder **"Puntensysteem en levels"** uit je MUST HAVE. Ik heb nergens in de app code gevonden voor punten of levels.

Wil je dat ik "Puntensysteem en levels" verplaats naar **WON'T HAVE** of helemaal weghalen? En heb je een Word/PDF bestand van deze MoSCoW analyse dat ik direct kan aanpassen? Zo ja, geef me het pad naar het bestand.

## User

okay so here this is my old one, but now i dont use the blender or make human i use other stuff but i also forgot what i use can u make me one like this but with the things actually used in my project

## Assistant

Laat me even checken wat je nu allemaal gebruikt in je project:

## Assistant

_(tool: Bash)_

## Assistant

_(tool: Bash)_

## Assistant

_(tool: Read)_

## Assistant

_(tool: Bash)_

## Assistant

_(tool: Bash)_

## Assistant

_(tool: Read)_

## Assistant

Hier is je nieuwe tech stack overzicht, gebaseerd op wat ik daadwerkelijk in je project heb gevonden:

---

## **React Native + Expo**
React Native met Expo gebruik ik om de interface van de app te bouwen voor iOS, Android en web. Denk aan schermen, knoppen, formulieren en navigatie. Expo Router zorgt voor de file-based navigatie tussen pagina's zoals login, wardrobe, profile en recycle.

### Advantages
- Eén codebase voor iOS, Android én web
- Expo maakt opzetten en testen heel snel
- File-based routing is overzichtelijk

### Challenges
- Sommige native libraries werken niet altijd meteen
- Updates van Expo SDK vragen aandacht

---

## **Three.js + React Three Fiber + Drei**
Three.js samen met React Three Fiber gebruik ik om 3D-content in de app te tonen. Hiermee kan ik de avatar en kleding in 3D weergeven en laten wisselen. Drei levert handige helpers zoals camera-controls en GLTF-loaders. Expo-GL en Expo-Three zorgen dat dit werkt binnen Expo.

### Advantages
- Maakt 3D mogelijk in een React Native omgeving
- Werkt declaratief, past goed bij React
- Ondersteunt 3D-bestanden zoals .glb

### Challenges
- Technisch en soms complex
- Performance op mobiel moet goed opgevolgd worden
- Combinatie met Expo-GL vraagt extra configuratie

---

## **GLB 3D-modellen**
In `assets/models` staan al mijn 3D-bestanden (lichaamsvormen, haren, kleding, schoenen, accessoires) als .glb. Deze worden in de app geladen om de avatar samen te stellen.

### Advantages
- .glb is licht en snel inlaadbaar
- Eén bestand bevat geometrie, materialen en textures
- Makkelijk wisselbaar in code

### Challenges
- Bestanden moeten geoptimaliseerd zijn voor mobiel
- Veel modellen → veel beheer

---

## **Node.js + Express + MongoDB**
Node.js met Express gebruik ik als backend en MongoDB (via Mongoose) om data op te slaan, zoals gebruikers, outfits, kleding en recycle posts. Dit vormt de technische basis van de app.

### Advantages
- Geschikt voor web- en app-projecten
- Flexibel omgaan met data
- Veel documentatie beschikbaar

### Challenges
- Goede structuur is noodzakelijk
- Veiligheid en data-validatie vragen extra aandacht

---

## **Authenticatie & Uploads (bcryptjs, Multer, Background Removal)**
Voor login en signup gebruik ik **bcryptjs** om wachtwoorden veilig te hashen. **Multer** verwerkt foto-uploads (bv. kleding toevoegen via camera/galerij), en **@imgly/background-removal-node** verwijdert automatisch de achtergrond van geüploade kledingfoto's.

### Advantages
- Veilige opslag van wachtwoorden
- Automatische background removal = professionele uitstraling
- Eenvoudige integratie met Express

### Challenges
- Background removal is zwaar voor de server
- Uploads moeten correct opgeruimd worden

---

## **Expo libraries (Image Picker, AsyncStorage, Reanimated, Google Fonts)**
- **expo-image-picker** → foto's nemen of kiezen uit galerij
- **@react-native-async-storage/async-storage** → lokale data opslaan (zoals login token)
- **react-native-reanimated** → vloeiende animaties
- **@expo-google-fonts/pixelify-sans** → het Pixelify Sans-lettertype voor de stijl van de app

### Advantages
- Alles werkt out-of-the-box met Expo
- Goede performance voor animaties
- Mooie typografie zonder eigen font hosting

### Challenges
- Reanimated heeft soms specifieke setup nodig
- AsyncStorage is niet versleuteld, dus niet voor gevoelige data

---

**Wil je dat ik dit als een Word document (.docx) voor je maak in dezelfde stijl als je oude lay-out?** Dan kan je het gewoon gebruiken voor je portfolio of verslag. Laat me ook weten of je nog een **design tool** toevoegt (zoals Figma voor het UI-design, of een 3D-tool waar je je .glb modellen vandaan haalt — heb je die zelf gemaakt of gedownload?).

## User

i also use vr i forgot the name to make the avatars and wardrobe no?

## Assistant

Ja, je bedoelt waarschijnlijk **VRoid Studio**! 🎨

Dat is een gratis programma van Pixiv waarmee je 3D anime-stijl avatars kunt maken — met haar, kleding, accessoires — en die kun je exporteren als `.vrm` of `.glb`. Gezien je modellen zoals `hair-pigtails.glb`, `spacebuns.glb`, `cute-dress.glb`, `fancy-dress.glb` enz. heeft, past dat perfect bij de VRoid Studio stijl.

Hier is de extra sectie die je aan je tech stack kan toevoegen:

---

## **VRoid Studio**
VRoid Studio gebruik ik om mijn avatars en kledingstukken in 3D te ontwerpen. Hiermee maak ik de lichaamstypes, haarstijlen, gezichten en kleding die ik daarna als `.glb` bestanden exporteer en in de app laad via Three.js / React Three Fiber.

### Advantages
- Gratis en eenvoudig in gebruik
- Speciaal gemaakt voor 3D avatar- en kledingontwerp
- Veel keuze in haar, kleding en gezichtsdetails
- Direct exporteren naar `.vrm` / `.glb` voor gebruik in de app
- Sluit goed aan bij mijn interesse in 3D mode

### Challenges
- Beperkte controle vergeleken met Blender voor maatwerk
- Modellen moeten soms nog geoptimaliseerd worden voor mobiel gebruik
- Eigen stijl (anime-look) is niet voor elk project geschikt

---

Klopt het dat het VRoid Studio is? Als het toch iets anders was (bv. **Ready Player Me**, **Mixamo**, of **Avaturn**), laat het weten en pas ik het aan!

## User

yes pls can u give it to me in a word document

## Assistant

_(tool: Skill)_

## User

Base directory for this skill: C:\Users\rinaz\AppData\Roaming\Claude\local-agent-mode-sessions\skills-plugin\fe7badda-e685-4554-864a-8301cb83885d\e2ee079c-011c-4f98-b373-f1651bc8adc8\skills\docx

# DOCX creation, editing, and analysis

## Overview

A .docx file is a ZIP archive containing XML files.

## Quick Reference

| Task | Approach |
|------|----------|
| Read/analyze content | `extract-text`, or unpack for raw XML |
| Create new document | Use `docx-js` - see Creating New Documents below |
| Edit existing document | Unpack → edit XML → repack - see Editing Existing Documents below |

### Converting .doc to .docx

Legacy `.doc` files must be converted before editing:

```bash
python scripts/office/soffice.py --headless --convert-to docx document.doc
```

### Reading Content

```bash
# Text extraction as markdown
extract-text document.docx

# Show tracked changes instead of accepting them
pandoc --track-changes=all document.docx -o output.md

# Raw XML access
python scripts/office/unpack.py document.docx unpacked/
```

### Converting to Images

```bash
python scripts/office/soffice.py --headless --convert-to pdf document.docx
pdftoppm -jpeg -r 150 document.pdf page
```

### Accepting Tracked Changes

To produce a clean document with all tracked changes accepted (requires LibreOffice):

```bash
python scripts/accept_changes.py input.docx output.docx
```

---

## Creating New Documents

Generate .docx files with JavaScript, then validate. Install: `npm install -g docx`

### Setup
```javascript
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
        Header, Footer, AlignmentType, PageOrientation, LevelFormat, ExternalHyperlink,
        InternalHyperlink, Bookmark, FootnoteReferenceRun, PositionalTab,
        PositionalTabAlignment, PositionalTabRelativeTo, PositionalTabLeader,
        TabStopType, TabStopPosition, Column, SectionType,
        TableOfContents, HeadingLevel, BorderStyle, WidthType, ShadingType,
        VerticalAlign, PageNumber, PageBreak } = require('docx');

const doc = new Document({ sections: [{ children: [/* content */] }] });
Packer.toBuffer(doc).then(buffer => fs.writeFileSync("doc.docx", buffer));
```

### Validation
After creating the file, validate it. If validation fails, unpack, fix the XML, and repack.
```bash
python scripts/office/validate.py doc.docx
```

### Page Size

```javascript
// CRITICAL: docx-js defaults to A4, not US Letter
// Always set page size explicitly for consistent results
sections: [{
  properties: {
    page: {
      size: {
        width: 12240,   // 8.5 inches in DXA
        height: 15840   // 11 inches in DXA
      },
      margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } // 1 inch margins
    }
  },
  children: [/* content */]
}]
```

**Common page sizes (DXA units, 1440 DXA = 1 inch):**

| Paper | Width | Height | Content Width (1" margins) |
|-------|-------|--------|---------------------------|
| US Letter | 12,240 | 15,840 | 9,360 |
| A4 (default) | 11,906 | 16,838 | 9,026 |

**Landscape orientation:** docx-js swaps width/height internally, so pass portrait dimensions and let it handle the swap:
```javascript
size: {
  width: 12240,   // Pass SHORT edge as width
  height: 15840,  // Pass LONG edge as height
  orientation: PageOrientation.LANDSCAPE  // docx-js swaps them in the XML
},
// Content width = 15840 - left margin - right margin (uses the long edge)
```

### Styles (Override Built-in Headings)

Use Arial as the default font (universally supported). Keep titles black for readability.

```javascript
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 24 } } }, // 12pt default
    paragraphStyles: [
      // IMPORTANT: Use exact IDs to override built-in styles
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 240, after: 240 }, outlineLevel: 0 } }, // outlineLevel required for TOC
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 180, after: 180 }, outlineLevel: 1 } },
    ]
  },
  sections: [{
    children: [
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Title")] }),
    ]
  }]
});
```

### Lists (NEVER use unicode bullets)

```javascript
// ❌ WRONG - never manually insert bullet characters
new Paragraph({ children: [new TextRun("• Item")] })  // BAD
new Paragraph({ children: [new TextRun("\u2022 Item")] })  // BAD

// ✅ CORRECT - use numbering config with LevelFormat.BULLET
const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [{
    children: [
      new Paragraph({ numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Bullet item")] }),
      new Paragraph({ numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Numbered item")] }),
    ]
  }]
});

// ⚠️ Each reference creates INDEPENDENT numbering
// Same reference = continues (1,2,3 then 4,5,6)
// Different reference = restarts (1,2,3 then 1,2,3)
```

### Tables

**CRITICAL: Tables need dual widths** - set both `columnWidths` on the table AND `width` on each cell. Without both, tables render incorrectly on some platforms.

```javascript
// CRITICAL: Always set table width for consistent rendering
// CRITICAL: Use ShadingType.CLEAR (not SOLID) to prevent black backgrounds
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

new Table({
  width: { size: 9360, type: WidthType.DXA }, // Always use DXA (percentages break in Google Docs)
  columnWidths: [4680, 4680], // Must sum to table width (DXA: 1440 = 1 inch)
  rows: [
    new TableRow({
      children: [
        new TableCell({
          borders,
          width: { size: 4680, type: WidthType.DXA }, // Also set on each cell
          shading: { fill: "D5E8F0", type: ShadingType.CLEAR }, // CLEAR not SOLID
          margins: { top: 80, bottom: 80, left: 120, right: 120 }, // Cell padding (internal, not added to width)
          children: [new Paragraph({ children: [new TextRun("Cell")] })]
        })
      ]
    })
  ]
})
```

**Table width calculation:**

Always use `WidthType.DXA` — `WidthType.PERCENTAGE` breaks in Google Docs.

```javascript
// Table width = sum of columnWidths = content width
// US Letter with 1" margins: 12240 - 2880 = 9360 DXA
width: { size: 9360, type: WidthType.DXA },
columnWidths: [7000, 2360]  // Must sum to table width
```

**Width rules:**
- **Always use `WidthType.DXA`** — never `WidthType.PERCENTAGE` (incompatible with Google Docs)
- Table width must equal the sum of `columnWidths`
- Cell `width` must match corresponding `columnWidth`
- Cell `margins` are internal padding - they reduce content area, not add to cell width
- For full-width tables: use content width (page width minus left and right margins)

### Images

```javascript
// CRITICAL: type parameter is REQUIRED
new Paragraph({
  children: [new ImageRun({
    type: "png", // Required: png, jpg, jpeg, gif, bmp, svg
    data: fs.readFileSync("image.png"),
    transformation: { width: 200, height: 150 },
    altText: { title: "Title", description: "Desc", name: "Name" } // All three required
  })]
})
```

### Page Breaks

```javascript
// CRITICAL: PageBreak must be inside a Paragraph
new Paragraph({ children: [new PageBreak()] })

// Or use pageBreakBefore
new Paragraph({ pageBreakBefore: true, children: [new TextRun("New page")] })
```

### Hyperlinks

```javascript
// External link
new Paragraph({
  children: [new ExternalHyperlink({
    children: [new TextRun({ text: "Click here", style: "Hyperlink" })],
    link: "https://example.com",
  })]
})

// Internal link (bookmark + reference)
// 1. Create bookmark at destination
new Paragraph({ heading: HeadingLevel.HEADING_1, children: [
  new Bookmark({ id: "chapter1", children: [new TextRun("Chapter 1")] }),
]})
// 2. Link to it
new Paragraph({ children: [new InternalHyperlink({
  children: [new TextRun({ text: "See Chapter 1", style: "Hyperlink" })],
  anchor: "chapter1",
})]})
```

### Footnotes

```javascript
const doc = new Document({
  footnotes: {
    1: { children: [new Paragraph("Source: Annual Report 2024")] },
    2: { children: [new Paragraph("See appendix for methodology")] },
  },
  sections: [{
    children: [new Paragraph({
      children: [
        new TextRun("Revenue grew 15%"),
        new FootnoteReferenceRun(1),
        new TextRun(" using adjusted metrics"),
        new FootnoteReferenceRun(2),
      ],
    })]
  }]
});
```

### Tab Stops

```javascript
// Right-align text on same line (e.g., date opposite a title)
new Paragraph({
  children: [
    new TextRun("Company Name"),
    new TextRun("\tJanuary 2025"),
  ],
  tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
})

// Dot leader (e.g., TOC-style)
new Paragraph({
  children: [
    new TextRun("Introduction"),
    new TextRun({ children: [
      new PositionalTab({
        alignment: PositionalTabAlignment.RIGHT,
        relativeTo: PositionalTabRelativeTo.MARGIN,
        leader: PositionalTabLeader.DOT,
      }),
      "3",
    ]}),
  ],
})
```

### Multi-Column Layouts

```javascript
// Equal-width columns
sections: [{
  properties: {
    column: {
      count: 2,          // number of columns
      space: 720,        // gap between columns in DXA (720 = 0.5 inch)
      equalWidth: true,
      separate: true,    // vertical line between columns
    },
  },
  children: [/* content flows naturally across columns */]
}]

// Custom-width columns (equalWidth must be false)
sections: [{
  properties: {
    column: {
      equalWidth: false,
      children: [
        new Column({ width: 5400, space: 720 }),
        new Column({ width: 3240 }),
      ],
    },
  },
  children: [/* content */]
}]
```

Force a column break with a new section using `type: SectionType.NEXT_COLUMN`.

### Table of Contents

```javascript
// CRITICAL: Headings must use HeadingLevel ONLY - no custom styles
new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" })
```

### Headers/Footers

```javascript
sections: [{
  properties: {
    page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } // 1440 = 1 inch
  },
  headers: {
    default: new Header({ children: [new Paragraph({ children: [new TextRun("Header")] })] })
  },
  footers: {
    default: new Footer({ children: [new Paragraph({
      children: [new TextRun("Page "), new TextRun({ children: [PageNumber.CURRENT] })]
    })] })
  },
  children: [/* content */]
}]
```

### Critical Rules for docx-js

- **Set page size explicitly** - docx-js defaults to A4; use US Letter (12240 x 15840 DXA) for US documents
- **Landscape: pass portrait dimensions** - docx-js swaps width/height internally; pass short edge as `width`, long edge as `height`, and set `orientation: PageOrientation.LANDSCAPE`
- **Never use `\n`** - use separate Paragraph elements
- **Never use unicode bullets** - use `LevelFormat.BULLET` with numbering config
- **PageBreak must be in Paragraph** - standalone creates invalid XML
- **ImageRun requires `type`** - always specify png/jpg/etc
- **Always set table `width` with DXA** - never use `WidthType.PERCENTAGE` (breaks in Google Docs)
- **Tables need dual widths** - `columnWidths` array AND cell `width`, both must match
- **Table width = sum of columnWidths** - for DXA, ensure they add up exactly
- **Always add cell margins** - use `margins: { top: 80, bottom: 80, left: 120, right: 120 }` for readable padding
- **Use `ShadingType.CLEAR`** - never SOLID for table shading
- **Never use tables as dividers/rules** - cells have minimum height and render as empty boxes (including in headers/footers); use `border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2E75B6", space: 1 } }` on a Paragraph instead. For two-column footers, use tab stops (see Tab Stops section), not tables
- **TOC requires HeadingLevel only** - no custom styles on heading paragraphs
- **Override built-in styles** - use exact IDs: "Heading1", "Heading2", etc.
- **Include `outlineLevel`** - required for TOC (0 for H1, 1 for H2, etc.)

---

## Editing Existing Documents

**Follow all 3 steps in order.**

### Step 1: Unpack
```bash
python scripts/office/unpack.py document.docx unpacked/
```
Extracts XML, pretty-prints, merges adjacent runs, and converts smart quotes to XML entities (`&#x201C;` etc.) so they survive editing. Use `--merge-runs false` to skip run merging.

### Step 2: Edit XML

Edit files in `unpacked/word/`. See XML Reference below for patterns.

**Use "Claude" as the author** for tracked changes and comments, unless the user explicitly requests use of a different name.

**Use the Edit tool directly for string replacement. Do not write Python scripts.** Scripts introduce unnecessary complexity. The Edit tool shows exactly what is being replaced.

**CRITICAL: Use smart quotes for new content.** When adding text with apostrophes or quotes, use XML entities to produce smart quotes:
```xml
<!-- Use these entities for professional typography -->
<w:t>Here&#x2019;s a quote: &#x201C;Hello&#x201D;</w:t>
```
| Entity | Character |
|--------|-----------|
| `&#x2018;` | ‘ (left single) |
| `&#x2019;` | ’ (right single / apostrophe) |
| `&#x201C;` | “ (left double) |
| `&#x201D;` | ” (right double) |

**Adding comments:** Use `comment.py` to handle boilerplate across multiple XML files (text must be pre-escaped XML):
```bash
python scripts/comment.py unpacked/ 0 "Comment text with &amp; and &#x2019;"
python scripts/comment.py unpacked/ 1 "Reply text" --parent 0  # reply to comment 0
python scripts/comment.py unpacked/ 0 "Text" --author "Custom Author"  # custom author name
```
Then add markers to document.xml (see Comments in XML Reference).

### Step 3: Pack
```bash
python scripts/office/pack.py unpacked/ output.docx --original document.docx
```
Validates with auto-repair, condenses XML, and creates DOCX. Use `--validate false` to skip.

**Auto-repair will fix:**
- `durableId` >= 0x7FFFFFFF (regenerates valid ID)
- Missing `xml:space="preserve"` on `<w:t>` with whitespace

**Auto-repair won't fix:**
- Malformed XML, invalid element nesting, missing relationships, schema violations

### Common Pitfalls

- **Replace entire `<w:r>` elements**: When adding tracked changes, replace the whole `<w:r>...</w:r>` block with `<w:del>...<w:ins>...` as siblings. Don't inject tracked change tags inside a run.
- **Preserve `<w:rPr>` formatting**: Copy the original run's `<w:rPr>` block into your tracked change runs to maintain bold, font size, etc.

---

## XML Reference

### Schema Compliance

- **Element order in `<w:pPr>`**: `<w:pStyle>`, `<w:numPr>`, `<w:spacing>`, `<w:ind>`, `<w:jc>`, `<w:rPr>` last
- **Whitespace**: Add `xml:space="preserve"` to `<w:t>` with leading/trailing spaces
- **RSIDs**: Must be 8-digit hex (e.g., `00AB1234`)

### Tracked Changes

**Insertion:**
```xml
<w:ins w:id="1" w:author="Claude" w:date="2025-01-01T00:00:00Z">
  <w:r><w:t>inserted text</w:t></w:r>
</w:ins>
```

**Deletion:**
```xml
<w:del w:id="2" w:author="Claude" w:date="2025-01-01T00:00:00Z">
  <w:r><w:delText>deleted text</w:delText></w:r>
</w:del>
```

**Inside `<w:del>`**: Use `<w:delText>` instead of `<w:t>`, and `<w:delInstrText>` instead of `<w:instrText>`.

**Minimal edits** - only mark what changes:
```xml
<!-- Change "30 days" to "60 days" -->
<w:r><w:t>The term is </w:t></w:r>
<w:del w:id="1" w:author="Claude" w:date="...">
  <w:r><w:delText>30</w:delText></w:r>
</w:del>
<w:ins w:id="2" w:author="Claude" w:date="...">
  <w:r><w:t>60</w:t></w:r>
</w:ins>
<w:r><w:t> days.</w:t></w:r>
```

**Deleting entire paragraphs/list items** - when removing ALL content from a paragraph, also mark the paragraph mark as deleted so it merges with the next paragraph. Add `<w:del/>` inside `<w:pPr><w:rPr>`:
```xml
<w:p>
  <w:pPr>
    <w:numPr>...</w:numPr>  <!-- list numbering if present -->
    <w:rPr>
      <w:del w:id="1" w:author="Claude" w:date="2025-01-01T00:00:00Z"/>
    </w:rPr>
  </w:pPr>
  <w:del w:id="2" w:author="Claude" w:date="2025-01-01T00:00:00Z">
    <w:r><w:delText>Entire paragraph content being deleted...</w:delText></w:r>
  </w:del>
</w:p>
```
Without the `<w:del/>` in `<w:pPr><w:rPr>`, accepting changes leaves an empty paragraph/list item.

**Rejecting another author's insertion** - nest deletion inside their insertion:
```xml
<w:ins w:author="Jane" w:id="5">
  <w:del w:author="Claude" w:id="10">
    <w:r><w:delText>their inserted text</w:delText></w:r>
  </w:del>
</w:ins>
```

**Restoring another author's deletion** - add insertion after (don't modify their deletion):
```xml
<w:del w:author="Jane" w:id="5">
  <w:r><w:delText>deleted text</w:delText></w:r>
</w:del>
<w:ins w:author="Claude" w:id="10">
  <w:r><w:t>deleted text</w:t></w:r>
</w:ins>
```

### Comments

After running `comment.py` (see Step 2), add markers to document.xml. For replies, use `--parent` flag and nest markers inside the parent's.

**CRITICAL: `<w:commentRangeStart>` and `<w:commentRangeEnd>` are siblings of `<w:r>`, never inside `<w:r>`.**

```xml
<!-- Comment markers are direct children of w:p, never inside w:r -->
<w:commentRangeStart w:id="0"/>
<w:del w:id="1" w:author="Claude" w:date="2025-01-01T00:00:00Z">
  <w:r><w:delText>deleted</w:delText></w:r>
</w:del>
<w:r><w:t> more text</w:t></w:r>
<w:commentRangeEnd w:id="0"/>
<w:r><w:rPr><w:rStyle w:val="CommentReference"/></w:rPr><w:commentReference w:id="0"/></w:r>

<!-- Comment 0 with reply 1 nested inside -->
<w:commentRangeStart w:id="0"/>
  <w:commentRangeStart w:id="1"/>
  <w:r><w:t>text</w:t></w:r>
  <w:commentRangeEnd w:id="1"/>
<w:commentRangeEnd w:id="0"/>
<w:r><w:rPr><w:rStyle w:val="CommentReference"/></w:rPr><w:commentReference w:id="0"/></w:r>
<w:r><w:rPr><w:rStyle w:val="CommentReference"/></w:rPr><w:commentReference w:id="1"/></w:r>
```

### Images

1. Add image file to `word/media/`
2. Add relationship to `word/_rels/document.xml.rels`:
```xml
<Relationship Id="rId5" Type=".../image" Target="media/image1.png"/>
```
3. Add content type to `[Content_Types].xml`:
```xml
<Default Extension="png" ContentType="image/png"/>
```
4. Reference in document.xml:
```xml
<w:drawing>
  <wp:inline>
    <wp:extent cx="914400" cy="914400"/>  <!-- EMUs: 914400 = 1 inch -->
    <a:graphic>
      <a:graphicData uri=".../picture">
        <pic:pic>
          <pic:blipFill><a:blip r:embed="rId5"/></pic:blipFill>
        </pic:pic>
      </a:graphicData>
    </a:graphic>
  </wp:inline>
</w:drawing>
```

---

## Dependencies

- **pandoc**: Text extraction
- **docx**: `npm install -g docx` (new documents)
- **LibreOffice**: PDF conversion (auto-configured for sandboxed environments via `scripts/office/soffice.py`)
- **Poppler**: `pdftoppm` for images


ARGUMENTS: Create a Word document with my project tech stack in the same style as my old one. Save to C:\Users\rinaz\Desktop\finalwork\finalwork\3Dgame\ava-robe\tech-stack.docx

## Assistant

_(tool: Bash)_

## User

[Request interrupted by user for tool use]


