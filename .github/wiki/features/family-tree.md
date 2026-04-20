# Family Tree

nFamily includes a genealogy module for building and sharing your family tree. Import from GEDCOM files, Geni.com, Ancestry, or MyHeritage.

**Status:** Planned — target P94 S41

---

## Tree Visualization

The family tree is an interactive canvas in the nFamily Flutter app:

- **Pan and zoom** via pinch gesture or trackpad
- **Node cards** show name, birth year, death year (if applicable), profile photo
- **Relationship lines** with GEDCOM-standard relationship types (parent, sibling, spouse, child)
- **ltree paths** in Postgres store the tree hierarchy for efficient ancestor/descendant queries

---

## Import Sources

| Source | Format | Method |
|--------|--------|--------|
| GEDCOM file | `.ged` | File upload |
| Geni.com | Geni OAuth | OAuth flow (family-geni plugin) |
| Ancestry.com | GEDCOM export | File upload |
| MyHeritage | GEDCOM export | File upload |

### GEDCOM Import

1. Export GEDCOM from your existing genealogy software.
2. Go to **Tree → Import → GEDCOM**.
3. Upload the `.ged` file.
4. Review import summary (N individuals, N families, N notes imported).
5. Confirm. Import runs in the background.

### Geni.com Import (requires `family-geni` plugin)

1. Go to **Tree → Import → Geni**.
2. Authenticate with your Geni.com account (OAuth redirect).
3. Select trees to import.
4. nFamily fetches your Geni tree via the Geni API and creates records in Postgres.

---

## Data Model

Family tree data is stored in:

| Table | Contents |
|-------|----------|
| `np_persons` | Individual records (name, birth, death, notes) |
| `np_relationships` | Person-to-person relationships with GEDCOM type |
| `np_person_paths` | ltree column for hierarchy queries |
| `np_events` | Life events (birth, marriage, death, immigration, etc.) |

Queries like "find all descendants of person X" use Postgres `<@` ltree operator for O(log n) lookup without recursive CTEs.

---

## Privacy

Family tree data is private to your deployment. The Geni OAuth flow only pulls data into your nSelf instance — no data is pushed back to Geni.com.
