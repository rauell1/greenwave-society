# Public CMS content

Use `/admin/content` with the content module enabled. Creation, editing, review,
publication and archival each require their existing CMS permissions.

## News

News, Article, Story and Announcement entries appear at `/news` and
`/news/<slug>` after publication. The listing, detail page, metadata and sitemap
all use the same content types. Drafts, review entries and archived entries are
excluded. Prefer unique slugs across these types because they share public URLs.
The existing article body field is HTML; use trusted editorial content.

## Activities

Select Activity, enter its title, summary/body, event date, category and media
link. Links must be local paths or HTTPS URLs. The homepage and Impact page show
up to 12 published activities, ordered by event date with the newest first.
Once activities are published, they replace the built-in historical timeline.

## Impact figures

Select Impact. The fixed slug is `impact-stats`; edit the existing entry when
updating figures. The editor supplies fields for youth reached, communities,
trees, events, workshops and waste recycled in tons. Values must be nonnegative;
all counts except waste must be integers. Publish to update the homepage hero,
impact section and Impact page. JSON-LD metrics use the same figures.

The body can describe the reporting period and evidence behind the figures.
It is retained in CMS revisions but is not displayed beside the counters.

## Publication and fallback

Publication, archival and revision saves invalidate the homepage, Impact page,
news routes and sitemap. Public pages also revalidate every 60 seconds. Saving a
published entry as a draft removes it from public queries until republished.

When there are no valid published activities or figures, the existing website
defaults remain visible. Database failures also use those defaults and log an
error. These defaults are historical values, not automatically calculated totals.
