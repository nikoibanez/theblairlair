# The Blair Lair

**The Blair Lair** is a fictional cryptid-comedy project built around Blair: a disgusting, suspiciously local rat-man who allegedly lurks around Raton, New Mexico.

The project is meant to be entertaining for **locals and tourists alike**. It treats Raton itself as part of the joke: familiar buildings, alleys, railroad spaces, storefronts, and bits of local visual texture become evidence in an intentionally ridiculous growing legend.

The goal is not to convince anyone Blair is real. The goal is to make the gag feel *locally real enough* that people recognize the places, add their own stories, and keep passing the joke around.

## The participatory myth

People who want to help build the legend — **“Blairians” is the current working name** — can contribute sightings, lore fragments, photographs, captions, flyers, fake evidence, jokes, fan art, and new variations on the Blair myth.

A Blair contribution might be:

- a clearly fictional “sighting” in a recognizable Raton location;
- a photo collage that places Blair somewhere he should absolutely not be;
- a one-paragraph local rumor or warning;
- a tourist-facing joke, scavenger clue, sticker, flyer, or mini-zine;
- a piece of Blair merch or fan art;
- a short video, meme, or social post that tags **Raton, New Mexico** and expands the running gag;
- a collaboration with a local business, event, artist, or visitor who wants to participate.

The broader idea is to create a **shareable local comedy myth**: something residents can recognize as theirs, visitors can discover while they are here, and social media can carry beyond town. If the project gets traction, every new contribution adds another reason for someone to search Raton, tag Raton, visit a location, or ask what the hell Blair is.

## What Blair is

Blair is intentionally pathetic, menacing, gross, and funny rather than a polished fantasy monster. He is half man, half rat, and usually appears in places involving wet pavement, questionable decisions, petty misconduct, dumpsters, alleys, railroad edges, or unexplained smells.

The visual language is equally deliberate: **photo collage, hard lasso cuts, torn paper, obvious seams, xerox texture, halftone, pasted stock photography, ugly masks, inconsistent grain, and handmade punk-flyer construction.** The project is not aiming for smooth fantasy illustration.

For the current site artwork, the final character imagery is assembled from supplied photographs and collage techniques rather than AI-generated creature art.

## Keep the joke fictional

Blair works best when the fiction is obvious enough to be funny and specific enough to feel local.

Please do **not** use the project to:

- accuse a real person or business of a crime or misconduct;
- create fake emergency, police, public-health, or government notices that could plausibly mislead someone;
- harass, impersonate, dox, or target real people;
- trespass, damage property, leave hazardous material, or interfere with businesses;
- fabricate evidence about a real ongoing incident;
- upload photographs you do not have permission to publish.

If a joke depends on somebody believing a real person is dangerous, guilty, missing, infected, wanted, or otherwise involved in an actual incident, it is outside the project.

## Contributing

GitHub participation is welcome through issues and pull requests. When contributing visual material, use original work, properly licensed stock, public-domain material, or material you have explicit permission to publish.

Useful contribution categories include:

1. **Lore** — short Blair stories, rumors, rules, warnings, or sightings.
2. **Sightings** — fictional photo evidence and location-based gags.
3. **Design** — collage assets, flyers, stickers, posters, zines, and merch concepts.
4. **Raton references** — public-facing local locations or details that make the joke recognizable without targeting private individuals.
5. **Web** — accessibility, responsive design, performance, interaction, and storefront improvements.
6. **Tourist participation** — ideas for QR codes, scavenger clues, maps, photo spots, or other ways visitors can encounter the myth in town.

## Site and storefront

The site is a static Netlify project with a small Netlify Function scaffold for optional Printify catalog synchronization. Until API credentials are configured, merch links hand off to the public Printify storefront.

### Local development

```bash
npm install
npm run dev
```

Netlify serves the site from `public/`.

### Optional Printify environment variables

```text
PRINTIFY_API_TOKEN
PRINTIFY_SHOP_ID
```

Do not commit those values to the repository.

## Project status

This is an active experiment in **local folklore as participatory comedy, place branding, tourism bait, collaborative art, and internet nonsense**. Names, lore, products, and participation mechanics are expected to change as the gag develops.

Blair is fictional. Raton is not.
