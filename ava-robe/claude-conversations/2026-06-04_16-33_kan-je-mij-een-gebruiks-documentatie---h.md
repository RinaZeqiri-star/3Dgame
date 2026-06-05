# kan je mij een gebruiks documentatie: - hoe moeten de leerkr...

**Date:** 2026-06-04T14:33:47.992Z
**Session ID:** `7bc6e39b-1a26-4ab0-8eb4-5acdc64b3544`

---

## User

kan je mij een gebruiks documentatie:
- hoe moeten de leerkrachten dat kunnen opzeten -> voor mijn magazine voor de project zetten aub

## Assistant

Ik ga eerst het project verkennen om te begrijpen waar de documentatie over moet gaan.

## Assistant

_(tool: Read)_

## Assistant

_(tool: Glob)_

## Assistant

_(tool: Glob)_

## Assistant

_(tool: Read)_

## Assistant

_(tool: Glob)_

## Assistant

_(tool: Glob)_

## Assistant

_(tool: Glob)_

## Assistant

_(tool: Read)_

## Assistant

_(tool: Read)_

## Assistant

_(tool: Read)_

## Assistant

_(tool: Read)_

## Assistant

Hieronder een **gebruiksdocumentatie voor leerkrachten** in het Nederlands, klaar om over te nemen in jouw magazine. Ik baseer me op wat ik in het project gezien heb (Expo/React Native app + Node.js server + MongoDB).

---

# 📘 Gebruiksdocumentatie – Ava-Robe

## Hoe leerkrachten de app kunnen opzetten

### 🎯 Wat is Ava-Robe?
Ava-Robe is een educatieve mobiele app rond duurzame mode. Leerlingen kunnen hun eigen 3D-avatar samenstellen, hun digitale kledingkast beheren, kleding hergebruiken via een recycle-functie en outfits laten aanbevelen. De app helpt jongeren spelenderwijs nadenken over circulaire mode.

---

### 🧰 Wat heb je nodig?

| Onderdeel | Vereiste |
|---|---|
| Computer | Windows, macOS of Linux |
| Node.js | Versie 18 of hoger |
| Expo Go | App op je smartphone (Android/iOS) |
| MongoDB | Gratis cloud-account via MongoDB Atlas |
| Internet | Computer en telefoon op **hetzelfde Wi-Fi netwerk** |

---

### ⚙️ Stap 1 — Installatie

1. Download het projectmapje en pak het uit op je computer.
2. Open een terminal in de map `ava-robe`.
3. Installeer de app-pakketten:
   ```
   npm install
   ```
4. Ga vervolgens naar de servermap en doe hetzelfde:
   ```
   cd server
   npm install
   ```

---

### 🗄️ Stap 2 — Databank koppelen

1. Maak een gratis account op **mongodb.com**.
2. Maak een nieuw cluster aan en kopieer je *connection string*.
3. Maak in de map `server` een bestand `.env` met daarin:
   ```
   MONGO_URI=jouw_connection_string_hier
   PORT=5000
   ```

---

### 🚀 Stap 3 — De server starten

In de map `server`:
```
npm run dev
```
De server draait nu op poort **5000**. Laat dit venster open staan.

---

### 📱 Stap 4 — De mobiele app starten

1. Zoek het IP-adres van je computer op (bv. `192.168.x.x`).
2. Open het bestand `app/signup.tsx` en pas deze regel aan met jouw IP:
   ```js
   const API_URL = "http://192.168.x.x:5000";
   ```
   *(Doe dit ook in de andere schermen waar `API_URL` staat.)*
3. Start in een nieuwe terminal de Expo-app:
   ```
   npx expo start
   ```
4. Scan de QR-code met **Expo Go** op de smartphone van de leerling.

---

### 👩‍🏫 Stap 5 — Leerlingen begeleiden

De leerlingen kunnen meteen aan de slag:

- **Registreren** met naam, e-mail en wachtwoord.
- **Avatar samenstellen** met huidskleur, haar, kledij en schoenen.
- **Kledingkast** vullen via foto's van eigen kleding.
- **Recycle-pagina** gebruiken om kleding door te geven aan klasgenoten.
- **Outfits** laten aanbevelen op basis van hun garderobe.
- **Munten** verdienen door duurzame keuzes te maken.

---

### 🛠️ Veelvoorkomende problemen

| Probleem | Oplossing |
|---|---|
| "Could not connect to server" | Controleer of de server draait en of het IP-adres juist is. |
| QR-code werkt niet | Zorg dat telefoon en computer op hetzelfde Wi-Fi zitten. |
| Database-fout | Controleer de `MONGO_URI` in het `.env`-bestand. |

---

### 💡 Tip voor in de klas
Werk in groepjes van 2 à 3 leerlingen rond één toestel. Zo ontstaat er automatisch gesprek over duurzame keuzes — precies het doel van Ava-Robe.

---

Wil je dat ik er ook een **korte versie** van maak (bv. één A4-pagina voor in een infobox), of net een uitgebreidere **screenshots-versie**? Laat maar weten.

## User

enft ik moet 2 zo hebben  (gebruiks documentatie:
- hoe moeten de leerkrachten dat kunnen opzeten de project (bakcendhosten, hoe die later draaien)) en (onderhouds decumenatie:
zijn er plugins, moeten die updates hebben) dus schrijf mij die over mijn project in een doorlopende tekst aub zo zet ik die in de magazine

## Assistant

Hieronder de twee teksten in **doorlopende vorm**, klaar om in je magazine te plaatsen.

---

## 📘 Gebruiksdocumentatie – Ava-Robe opzetten

Om Ava-Robe in de klas te gebruiken, moet de leerkracht eerst zorgen dat zowel de mobiele app als de backendserver correct draaien. Het project bestaat namelijk uit twee delen die samenwerken: de Expo-app die de leerlingen op hun smartphone openen, en een Node.js-server die alle gebruikersdata, kledingfoto's en recyclage-posts beheert. Beide delen moeten actief zijn voordat leerlingen kunnen inloggen of hun avatar kunnen samenstellen.

De installatie begint door het projectmapje op de computer van de leerkracht te plaatsen en in een terminal het commando `npm install` uit te voeren in de hoofdmap. Daarna doet de leerkracht hetzelfde in de submap `server`, zodat ook de backend zijn pakketten ophaalt. Vervolgens wordt een gratis MongoDB Atlas-account aangemaakt, en de bijhorende connection string wordt geplakt in een `.env`-bestand binnen de servermap, samen met de poort (standaard 5000). Zo weet de server waar hij de gegevens moet bewaren.

Wanneer alles klaarstaat, start de leerkracht eerst de backend met het commando `npm run dev` in de servermap. Dit zorgt ervoor dat de server permanent luistert naar aanvragen van de app, zoals het aanmaken van een account, het uploaden van een kledingfoto of het ophalen van outfitvoorstellen. Daarna wordt in een tweede terminal het commando `npx expo start` uitgevoerd vanuit de hoofdmap. Expo toont dan een QR-code die de leerlingen scannen met de gratis app **Expo Go** op hun smartphone. Belangrijk hierbij is dat de computer van de leerkracht en de telefoons van de leerlingen op hetzelfde wifi-netwerk zitten, en dat het IP-adres van de leerkracht zijn computer correct ingevuld is in de `API_URL`-variabele binnen de schermen van de app. Zonder dat juiste adres kan de telefoon de server niet bereiken.

Voor een latere, meer permanente opstelling kan de backend ook in de cloud gehost worden, bijvoorbeeld via **Render**, **Railway** of **Heroku**. Daarbij wordt de servermap als aparte service uitgerold en wordt diezelfde MongoDB Atlas-databank gekoppeld via de omgevingsvariabelen. Vanaf dat moment hoeft de leerkracht zijn eigen computer niet meer aan te laten staan tijdens de les: de leerlingen kunnen de app gewoon openen, en de gehoste server vangt al hun verzoeken op. Dit is de aanbevolen werkwijze voor structureel klasgebruik, omdat het IP-adres dan vervangen wordt door een vaste online URL die nooit verandert.

---

## 🛠️ Onderhoudsdocumentatie – Plugins en updates

Ava-Robe leunt op een aantal externe bibliotheken en tools die regelmatig onderhoud vragen. De mobiele app is gebouwd met **Expo** en **React Native**, aangevuld met **Three.js**, **@react-three/fiber** en **@react-three/drei** voor het 3D-avatar gedeelte. Daarnaast worden Expo-modules gebruikt zoals `expo-router` voor de navigatie, `expo-image-picker` om kledingfoto's te uploaden, `expo-media-library` voor toegang tot de fotogalerij, en `expo-font` voor het lettertype Pixelify Sans. Aan de serverzijde draait alles op **Express**, met **Mongoose** voor de databankverbinding, **Multer** voor het ontvangen van afbeeldingen, **bcryptjs** voor het versleutelen van wachtwoorden en **@imgly/background-removal-node** voor het automatisch verwijderen van de achtergrond rond gefotografeerde kledingstukken.

Omdat Expo elk half jaar een nieuwe hoofdversie uitbrengt, is het belangrijk dat de leerkracht of beheerder minstens twee keer per jaar het project bijwerkt. Dit gebeurt eenvoudig met het commando `npx expo install --check` in de projectmap, dat automatisch controleert of alle Expo-pakketten nog compatibel zijn met de huidige versie en suggesties geeft voor updates. Voor gewone npm-pakketten kan `npm outdated` gebruikt worden om te zien welke bibliotheken verouderd zijn, en `npm update` om ze veilig te verversen. Grote versiesprongen, zoals van React Native 0.81 naar een nieuwere release, vragen extra aandacht: hier raden we aan eerst de Expo SDK upgrade-gids te volgen voordat er iets gewijzigd wordt, omdat sommige modules dan hun API aanpassen.

Aan de serverkant is het onderhoud iets eenvoudiger, maar minstens zo belangrijk. De pakketten **Express**, **Mongoose** en **bcryptjs** worden regelmatig geüpdatet om veiligheidslekken te dichten. Met het commando `npm audit` binnen de servermap krijgt de beheerder een overzicht van bekende kwetsbaarheden, en `npm audit fix` lost de meeste daarvan automatisch op. Het is verstandig dit minstens elke maand uit te voeren, zeker omdat de server gevoelige gegevens zoals wachtwoorden en e-mailadressen verwerkt. Wachtwoorden worden weliswaar versleuteld opgeslagen met bcrypt, maar een verouderde Express-versie kan alsnog een ingang vormen voor aanvallers.

Naast de softwarepakketten verdient ook **MongoDB Atlas** aandacht. Het gratis cluster blijft normaal automatisch actief, maar Atlas pauzeert clusters die langere tijd ongebruikt zijn. Bij het begin van een nieuw schooljaar controleert de leerkracht best even of de databank nog beschikbaar is, en of er voldoende opslagruimte vrij is voor nieuwe foto's. De map `server/uploads` op de hostende server kan na verloop van tijd ook vollopen met oude afbeeldingen; daarvoor is het script `cleanup-recycle-posts.js` voorzien, dat oude recyclage-posts opruimt. Dit script kan handmatig of via een geplande taak (cron job) periodiek worden uitgevoerd. Door dit eenvoudige onderhoud — Expo-updates twee keer per jaar, npm-audits maandelijks, en een opkuis van de uploads waar nodig — blijft Ava-Robe vlot en veilig draaien gedurende meerdere schooljaren.

---

Wil je dat ik er nog een **inleidende paragraaf** bij schrijf die beide stukken aan elkaar verbindt voor in het magazine?

## User

and the api for the remove background that it can be op? should that not be in the onderhoudsdocumentatie ook?

## Assistant

Goed punt! Laat me eerst even checken hoe de background-removal precies werkt in het project.

## Assistant

_(tool: Grep)_

## Assistant

_(tool: Read)_

## Assistant

Helemaal terecht — de app gebruikt inderdaad de externe **remove.bg API** (via `api.remove.bg`) om achtergronden van kledingfoto's te verwijderen, en die hangt af van een API-sleutel met een beperkt aantal credits. Dat hoort zeker in de onderhoudsdocumentatie. Hier is een extra paragraaf die je kan toevoegen aan het stuk **Onderhoudsdocumentatie**:

---

Een specifiek aandachtspunt binnen het onderhoud is de externe **remove.bg API**, die Ava-Robe gebruikt om automatisch de achtergrond rond gefotografeerde kledingstukken weg te halen. Wanneer een leerling een nieuwe foto uploadt naar zijn of haar digitale kast, stuurt de server die foto door naar `api.remove.bg`, samen met een persoonlijke API-sleutel die opgeslagen is in het `.env`-bestand onder de naam `REMOVE_BG_API_KEY`. De dienst werkt met een **credit-systeem**: het gratis abonnement geeft een beperkt aantal verwerkingen per maand, en zodra dat krediet op is, weigert de API verdere aanvragen. Leerlingen krijgen op dat moment hun foto gewoon mét achtergrond terug, omdat het project een ingebouwde **fallback** heeft die de originele afbeelding teruggeeft als de API faalt of als de sleutel ontbreekt. De app blijft dus werken, maar het visuele resultaat is minder mooi.

Voor het onderhoud betekent dit dat de beheerder regelmatig moet inloggen op het remove.bg-dashboard om het resterende krediet te controleren, zeker voor het begin van een nieuw lesblok waarin veel uploads verwacht worden. Wanneer het krediet bijna op is, kan er ofwel een betalend pakket aangekocht worden, ofwel een nieuwe gratis sleutel aangemaakt worden via een ander account. Daarnaast is het verstandig om af en toe te checken of remove.bg zelf nog online is en of hun API-structuur niet gewijzigd is — bij grote wijzigingen van de provider moet eventueel het endpoint `https://api.remove.bg/v1.0/removebg` of de bijhorende parameters in `server/index.js` aangepast worden. Als alternatief biedt het project ook het pakket **@imgly/background-removal-node** aan, dat lokaal op de server kan draaien zonder externe dienst; bij langdurige problemen met remove.bg kan de leerkracht of ontwikkelaar overschakelen naar deze offline-oplossing, zonder dat de leerlingen er iets van merken.

---

Wil je dat ik de volledige **onderhoudsdocumentatie opnieuw uitschrijf** met deze paragraaf netjes ingewerkt, zodat je één doorlopende tekst hebt om in je magazine te plaatsen?

## User

yes pls

## Assistant

Hier is de volledige **onderhoudsdocumentatie** als één doorlopende tekst, klaar voor je magazine:

---

## 🛠️ Onderhoudsdocumentatie – Ava-Robe

Ava-Robe leunt op een aantal externe bibliotheken en tools die regelmatig onderhoud vragen. De mobiele app is gebouwd met **Expo** en **React Native**, aangevuld met **Three.js**, **@react-three/fiber** en **@react-three/drei** voor het 3D-avatar gedeelte. Daarnaast worden Expo-modules gebruikt zoals `expo-router` voor de navigatie tussen schermen, `expo-image-picker` om kledingfoto's te uploaden, `expo-media-library` voor toegang tot de fotogalerij van de leerling, en `expo-font` voor het lettertype Pixelify Sans dat de speelse uitstraling van de app bepaalt. Aan de serverzijde draait alles op **Express**, met **Mongoose** voor de verbinding met de MongoDB-databank, **Multer** voor het ontvangen van afbeeldingen, **bcryptjs** voor het veilig versleutelen van wachtwoorden, en **@imgly/background-removal-node** als lokale terugvaloptie voor het verwijderen van achtergronden bij kledingfoto's.

Omdat Expo elk half jaar een nieuwe hoofdversie uitbrengt, is het belangrijk dat de leerkracht of beheerder minstens twee keer per jaar het project bijwerkt. Dit gebeurt eenvoudig met het commando `npx expo install --check` in de projectmap, dat automatisch controleert of alle Expo-pakketten nog compatibel zijn met de huidige SDK-versie en suggesties geeft voor updates. Voor gewone npm-pakketten kan `npm outdated` gebruikt worden om te zien welke bibliotheken verouderd zijn, en `npm update` om ze veilig te verversen. Grote versiesprongen, zoals van React Native 0.81 naar een nieuwere release, vragen extra aandacht: hier raden we aan eerst de officiële Expo SDK upgrade-gids te volgen voordat er iets gewijzigd wordt, omdat sommige modules dan hun API aanpassen en bestaande schermen anders kunnen breken.

Aan de serverkant is het onderhoud iets eenvoudiger, maar minstens zo belangrijk. De pakketten **Express**, **Mongoose** en **bcryptjs** worden regelmatig geüpdatet om veiligheidslekken te dichten. Met het commando `npm audit` binnen de servermap krijgt de beheerder een overzicht van bekende kwetsbaarheden, en `npm audit fix` lost de meeste daarvan automatisch op. Het is verstandig dit minstens elke maand uit te voeren, zeker omdat de server gevoelige gegevens zoals wachtwoorden en e-mailadressen verwerkt. Wachtwoorden worden weliswaar versleuteld opgeslagen met bcrypt, maar een verouderde Express-versie kan alsnog een ingang vormen voor aanvallers, dus regelmatige updates blijven cruciaal.

Een specifiek aandachtspunt binnen het onderhoud is de externe **remove.bg API**, die Ava-Robe gebruikt om automatisch de achtergrond rond gefotografeerde kledingstukken weg te halen. Wanneer een leerling een nieuwe foto uploadt naar zijn of haar digitale kast, stuurt de server die foto door naar `api.remove.bg`, samen met een persoonlijke API-sleutel die opgeslagen is in het `.env`-bestand onder de naam `REMOVE_BG_API_KEY`. De dienst werkt met een credit-systeem: het gratis abonnement geeft een beperkt aantal verwerkingen per maand, en zodra dat krediet op is, weigert de API verdere aanvragen. Leerlingen krijgen op dat moment hun foto gewoon mét achtergrond terug, omdat het project een ingebouwde fallback heeft die de originele afbeelding teruggeeft als de API faalt of als de sleutel ontbreekt. De app blijft dus werken, maar het visuele resultaat is minder mooi.

Voor het onderhoud van die dienst betekent dit dat de beheerder regelmatig moet inloggen op het remove.bg-dashboard om het resterende krediet te controleren, zeker voor het begin van een nieuw lesblok waarin veel uploads verwacht worden. Wanneer het krediet bijna op is, kan er ofwel een betalend pakket aangekocht worden, ofwel een nieuwe gratis sleutel aangemaakt worden via een ander account. Daarnaast is het verstandig om af en toe te checken of remove.bg zelf nog online is en of hun API-structuur niet gewijzigd is — bij grote wijzigingen van de provider moet eventueel het endpoint `https://api.remove.bg/v1.0/removebg` of de bijhorende parameters in `server/index.js` aangepast worden. Als alternatief biedt het project ook het pakket **@imgly/background-removal-node** aan, dat lokaal op de server kan draaien zonder externe dienst; bij langdurige problemen met remove.bg kan de leerkracht of ontwikkelaar overschakelen naar deze offline-oplossing, zonder dat de leerlingen er iets van merken.

Naast de softwarepakketten en externe diensten verdient ook **MongoDB Atlas** aandacht. Het gratis cluster blijft normaal automatisch actief, maar Atlas pauzeert clusters die langere tijd ongebruikt zijn, bijvoorbeeld tijdens een zomervakantie. Bij het begin van een nieuw schooljaar controleert de leerkracht best even of de databank nog beschikbaar is, en of er voldoende opslagruimte vrij is voor nieuwe foto's en gebruikersaccounts. De map `server/uploads` op de hostende server kan na verloop van tijd ook vollopen met oude afbeeldingen; daarvoor is het script `cleanup-recycle-posts.js` voorzien, dat oude recyclage-posts opruimt. Dit script kan handmatig uitgevoerd worden of via een geplande taak (cron job) periodiek draaien. Door dit eenvoudige onderhoud — Expo-updates twee keer per jaar, npm-audits elke maand, een check op het remove.bg-krediet voor elk lesblok, en een opkuis van de uploads waar nodig — blijft Ava-Robe vlot, veilig en visueel verzorgd draaien gedurende meerdere schooljaren.

---

Klaar om in je magazine te plaatsen! Wil je dat ik er nog een **korte conclusie of openingsalinea** bij schrijf om beide documenten (gebruik + onderhoud) als één geheel te presenteren?


