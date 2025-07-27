# bingo app

## deployment

copy ./app/ to deployment destination and serve - all files are static assets.

## configuration

all configuration uses `./app/datasets/config.json`.  this file should look similar to the following:

```json
{
  "datasets": [
    "default"
  ],
  "available_flags": [
    "beep",
    "boop",
    "bork",
    "brrt",
    "blab"
  ]
}
```

### dataset configuration

datasets (which are JSON files in the `./app/datasets/` directory) must be listed inside of the config entry `$.datasets[]` as a string. entries ARE case-sensitive and should be exactly the same.

dataset file names should be alphanumeric (hyphens and underscores also accepted, but only those) and use the `.json` file extension.

e.g. the following:

- `default.json`
- `my-event.json`
- `event-2026.json`

data

### flag configuration

for flags to be made available to users to pick or ignore, they must be listed inside of the config entry `$.available_flags[]` as a string. entries ARE case sensitive.

flags are arbitrary strings that should be included with entries to allow users to permit or deny their inclusion.  flags can (and should) be reused across entries where appropriate.  multiple flags can also be specified for an entry where appropriate.

if flags are not listed here, users will not be able to choose to allow them - leading to any entries with a flag not appearing in this array to be entirely excluded.  this is intended.  you **must** list flags if you want users able to interact with entries that have that flag.

## datasets

as mentioned above, datasets are JSON files in the `./app/datasets/` directory.

dataset contents should be similar to the following:

```json
{
  "entries": [
    {
      "text": "TEST1",
      "flags": ["beep"]
    },
    {
      "text": "TEST2"
    }
  ]
}
```

entries should be JSON objects provided inside of the array `$.entries[]`.  entries are formed like the following:

```json
{
  "text": "Entry text",
  "flags": [
    "flags",
    "that-are",
    "relevant"
  ],
  "weight": 2,
  "sensitivity": "Q",
  "enabled": false
}
```

the properties available to entries follow:

- `text`: `(string)` - **REQUIRED** - this is the *literal* text of the entry presented to the user. brevity is important, as overly long text will render poorly on some display configurations.
- `flags`: `(array<string>)` this is an array of flags that should be associated with this entry. flags should be consistent between entries and ARE case sensitive.  can be omitted if no flags are to be specified for the entry.
- `weight`: `(int)` this is a positive integer representing the "weighting" of the entry relative to other entries' weights. be aware that uncanny selection behavior results when very high weights (5+) are used, occasionally leading to blatant sequences forming and being displayed in cards instead of visibly random selections.  if omitted, the entry will have a "weight" of 1.
- `sensitivity`: `(string)` this is a string indicating the sensitivity of the entry. permitted values are the shorthand of `S`, `Q`, `E`, and `X` - or their full alternatives `SAFE`, `QUESTIONABLE`, `EXPLICIT`, and `EXTREME`.  if omitted, the entry will have a sensitivity of `SAFE`.
- `enabled`: `(boolean)` this is a boolean flag which allows excluding an entry regardless of configuration, intended as an "emergency disable" if necessary - it should only be rarely used, if ever.  if omitted, the entry will have `enabled` set to `true`.

### sensitivity

sensitivity is a *gradient*, going from `SAFE` to `QUESTIONABLE` to `EXPLICIT`.
for example, if a user specifies `SAFE` as their threshold, ***all*** other sensitivity levels are banned, and entries using those sensitivity levels are excluded from selection.
as another example, if a user specifies `QUESTIONABLE` as their threshold, then entries using the sensitivities `SAFE` and `QUESTIONABLE` will be candidates for random selection while entries using the sensitivity `EXPLICIT` will be excluded.

## pool randomness

due to the `flags` and `sensitivity` capabilities made available in this application, it is possible that the dataset may not contain enough viable entries in some configurations to populate the card or *seem* to randomly populate the card.
it is recommended that the **narrowest** configuration possible by the user contain at least 48 entries for healthy and visibly random results.

as an example, specifying a sensitivity threshold of `SAFE` and specifying ***no*** allowed flags for entries would likely result in a very limited number of candidate entries. if this configuration does not possess at least **24** entries, the generator will produce an error.
**this is not a bug, this is due to the dataset being too small.**
