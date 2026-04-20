# Photo Albums

nFamily photo albums give your family a private, self-hosted alternative to Google Photos or iCloud. Photos are stored in your nSelf MinIO instance — your images never leave your infrastructure.

**Status:** Planned — target P94 S38

---

## Creating an Album

1. **nFamily app → Photos → New Album**
2. Name the album and optionally assign it to a time range or event.
3. Upload photos via the app (iOS/Android/macOS/desktop) or drag-and-drop in the web app.

Photos are stored in MinIO. Thumbnails are generated at 200px and 800px by the `photos` plugin. Original files are never modified.

---

## EXIF Metadata

The `photos` plugin reads EXIF metadata from every uploaded photo:

| EXIF field | Stored as |
|------------|-----------|
| DateTimeOriginal | `np_photos.taken_at` |
| GPSLatitude / GPSLongitude | `np_photos.location` (PostGIS point) |
| Make / Model | `np_photos.camera` |
| Orientation | Applied to thumbnail generation |

Photos with GPS coordinates appear on a map view in the album (requires `geocoding` free plugin for reverse geocoding).

---

## pgvector Similarity

The `photos` plugin generates a visual embedding for each photo using a local CLIP-compatible model (runs on your server via the `ai` plugin). The embedding enables:

- **"Similar photos"** — click any photo to see visually similar photos from your library
- **"Find photos of person"** — (when face embeddings are added in a future release)
- **"Find photos from this location"** — semantic location search

---

## Timeline View

The **Timeline** is the default album view. Photos are arranged on a vertical timeline by `taken_at` date. Groupings:

- **By day** — photos from the same calendar day cluster together
- **By trip** — photos within 48h of each other in the same geographic area cluster as a trip
- **By album** — manual albums appear as named sections in the timeline

---

## Storage

Photos are stored in MinIO at:

```
photos/{family-id}/{year}/{month}/{photo-id}.{ext}
photos/{family-id}/{year}/{month}/thumb-200/{photo-id}.jpg
photos/{family-id}/{year}/{month}/thumb-800/{photo-id}.jpg
```

The `NTV_MEDIA_PATHS` configuration does not apply to nFamily photos. nFamily uses its own MinIO bucket: `nfamily-photos`.
