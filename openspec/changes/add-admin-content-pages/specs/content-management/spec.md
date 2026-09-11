## Purpose

Lets the shop owner edit the storefront's policy and about pages and the gallery video list from the Medusa admin, and exposes that content to the storefront.

## ADDED Requirements

### Requirement: Fixed set of content pages with defaults
The system SHALL manage exactly four content pages identified by the slugs `privacy`, `terms`, `shipping-returns` and `about`. Each page SHALL have a title, a meta description and a markdown body. Every page SHALL have default content shipped with the application, so a page that has never been saved still resolves to a complete title, description and body. Pages SHALL NOT be created or deleted through any endpoint or screen.

#### Scenario: Page never saved
- **WHEN** the `privacy` page is requested and no one has saved it
- **THEN** the response carries the default title, description and body for `privacy`

#### Scenario: Unknown slug
- **WHEN** a page with slug `faq` is requested through any endpoint
- **THEN** the response is 404

### Requirement: Store endpoint returns one page
The store API SHALL expose `GET /store/pages/:slug` returning `{ page: { slug, title, description, body, updated_at } }` for a known slug. `updated_at` SHALL be null when the page has never been saved. The endpoint SHALL require the publishable API key like every other store endpoint.

#### Scenario: Saved page
- **WHEN** the owner has saved the `terms` page with title `Terms & Conditions`
- **THEN** `GET /store/pages/terms` returns that title, description and body with a non-null `updated_at`

### Requirement: Admin saves a page
The admin API SHALL expose `GET /admin/pages/:slug`, returning the same shape as the store endpoint plus `is_default: true` when the page has never been saved, and `POST /admin/pages/:slug` taking `title` (1 to 120 characters), `description` (0 to 300 characters) and `body` (1 to 100000 characters). A valid post SHALL replace the page's stored content and respond with the saved page. A body that fails validation SHALL be rejected with status 400 naming the field. Both endpoints SHALL require an authenticated admin user.

#### Scenario: First save
- **WHEN** an admin posts a valid title, description and body to `/admin/pages/about`
- **THEN** the response is 200 with the saved page and `GET /store/pages/about` returns the posted content

#### Scenario: Empty body
- **WHEN** an admin posts a body of zero characters
- **THEN** the response is 400 and names `body`

#### Scenario: Unauthenticated
- **WHEN** a request without an admin session or token posts to `/admin/pages/about`
- **THEN** the response is 401 and nothing is saved

### Requirement: Gallery video list
The system SHALL keep an ordered list of gallery videos, each with a YouTube video id and a title. The store API SHALL expose `GET /store/gallery` returning `{ videos: [{ id, youtube_id, title }] }` in display order. An empty list SHALL be returned as an empty array.

#### Scenario: Ordered list
- **WHEN** three videos exist with display positions 1, 2 and 3
- **THEN** `GET /store/gallery` returns them in that order

#### Scenario: No videos
- **WHEN** no video has been added
- **THEN** `GET /store/gallery` returns `{ videos: [] }`

### Requirement: Admin manages gallery videos
The admin API SHALL expose `GET /admin/gallery` returning the ordered list, `POST /admin/gallery` taking `url` and `title` (1 to 120 characters), `DELETE /admin/gallery/:id`, and `POST /admin/gallery/order` taking `ids`, the complete list of video ids in the new display order. `url` SHALL accept a `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/` or `youtube.com/embed/` link, or a bare 11-character video id, and SHALL be stored as the extracted id. Any other `url` SHALL be rejected with status 400 naming `url`. A new video SHALL be appended at the end. An `ids` list that is not a permutation of the existing ids SHALL be rejected with status 400. All endpoints SHALL require an authenticated admin user.

#### Scenario: Add by share link
- **WHEN** an admin posts `url` `https://youtu.be/srRVUe4_wW4` and title `verkei?`
- **THEN** the response is 200 with a video whose `youtube_id` is `srRVUe4_wW4`, and it is last in `GET /store/gallery`

#### Scenario: Not a YouTube link
- **WHEN** an admin posts `url` `https://vimeo.com/12345`
- **THEN** the response is 400 and names `url`

#### Scenario: Reorder
- **WHEN** an admin posts `ids` listing the existing three videos in reverse
- **THEN** `GET /store/gallery` returns them in the reversed order

#### Scenario: Remove
- **WHEN** an admin deletes a video by id
- **THEN** it no longer appears in `GET /store/gallery` and the remaining order is unchanged

### Requirement: Content group in the admin sidebar
The admin dashboard SHALL show a **Content** item in the main sidebar that expands into one entry per content page and a **Gallery** entry. Each page entry SHALL open a form with the page's current title, description and body, prefilled with the defaults when the page has never been saved, and a save action that persists the form and confirms with a toast. The Gallery entry SHALL list the videos in display order with their titles and ids, let the admin add a video by pasting a YouTube URL and a title, remove a video, and move a video up or down, each action persisting immediately and confirming or reporting failure with a toast.

#### Scenario: Editing a page
- **WHEN** an admin opens Content, then Privacy Policy, changes the body and saves
- **THEN** a success toast appears and reopening the screen shows the saved body

#### Scenario: Save rejected
- **WHEN** an admin clears the title and saves
- **THEN** an error toast shows the validation message and the form keeps the entered values

#### Scenario: Moving a video up
- **WHEN** an admin clicks move up on the second video
- **THEN** it becomes first in the list and in `GET /store/gallery`
