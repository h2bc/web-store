## Purpose

Lets the shop owner edit the storefront's policy and about pages and the gallery video list from the Medusa admin, and exposes that content to the storefront.

## ADDED Requirements

### Requirement: Fixed set of content pages
The system SHALL manage the text of exactly four screens identified by the slugs `privacy`, `terms`, `shipping-returns` and `about`. Each SHALL have a title, a meta description and a markdown body. No text SHALL live in application source: the content seed SHALL insert generated placeholder text with the screen's title for rows that do not exist and SHALL skip rows that already exist. A screen that has not been seeded or saved SHALL answer 404. Rows SHALL NOT be created or deleted through any endpoint or screen beyond that first save.

#### Scenario: Seeded page
- **WHEN** the page seed has run and `privacy` is requested
- **THEN** the response carries the seeded title, description and body

#### Scenario: Page without content
- **WHEN** the `about` page is requested before any seed or save
- **THEN** the response is 404

#### Scenario: Unknown slug
- **WHEN** a page with slug `faq` is requested through any endpoint
- **THEN** the response is 404

### Requirement: Store endpoint returns one page
The store API SHALL expose `GET /store/<slug>`, one route per screen (`/store/privacy`, `/store/terms`, `/store/shipping-returns`, `/store/about`), returning `{ content_page: { slug, title, description, body, updated_at } }` for a known slug with content. The endpoint SHALL require the publishable API key like every other store endpoint.

#### Scenario: Saved page
- **WHEN** the owner has saved the `terms` page with title `Terms & Conditions`
- **THEN** `GET /store/terms` returns that title, description and body with a non-null `updated_at`

### Requirement: Admin saves a page
The admin API SHALL expose `GET /admin/<slug>`, returning the same shape as the store endpoint, and `POST /admin/<slug>` taking `title` (1 to 120 characters), `description` (0 to 300 characters) and `body` (1 to 100000 characters). A valid post SHALL create or replace the page's stored content and respond with the saved page. A body that fails validation SHALL be rejected with status 400 naming the field. Both endpoints SHALL require an authenticated admin user.

#### Scenario: First save
- **WHEN** an admin posts a valid title, description and body to `/admin/about`
- **THEN** the response is 200 with the saved page and `GET /store/about` returns the posted content

#### Scenario: Empty body
- **WHEN** an admin posts a body of zero characters
- **THEN** the response is 400 and names `body`

#### Scenario: Unauthenticated
- **WHEN** a request without an admin session or token posts to `/admin/about`
- **THEN** the response is 401 and nothing is saved

### Requirement: Gallery video list
The system SHALL keep an ordered list of gallery videos, each with an embed URL the storefront frames as is and a title. The store API SHALL expose `GET /store/gallery` returning `{ videos: [{ id, url, title }] }` in display order. An empty list SHALL be returned as an empty array.

#### Scenario: Ordered list
- **WHEN** three videos exist with display positions 1, 2 and 3
- **THEN** `GET /store/gallery` returns them in that order

#### Scenario: No videos
- **WHEN** no video has been added
- **THEN** `GET /store/gallery` returns `{ videos: [] }`

### Requirement: Admin manages gallery videos
The admin API SHALL expose `GET /admin/gallery` returning the ordered list and `POST /admin/gallery` taking `videos`, the complete list in display order, each entry with `url` and a `title` of 1 to 120 characters. `url` SHALL accept a `youtube.com/watch?v=`, `youtu.be/` or `youtube.com/embed/` link and SHALL be stored as the `https://www.youtube.com/embed/<id>` URL. A valid post SHALL replace the whole list and respond with the saved list. Any entry with another `url` SHALL be rejected with status 400 naming `url`, and nothing SHALL change. Both endpoints SHALL require an authenticated admin user.

#### Scenario: Save by share link
- **WHEN** an admin posts `videos` with `url` `https://youtu.be/srRVUe4_wW4` and title `verkei?`
- **THEN** the response is 200 with a video whose `url` is `https://www.youtube.com/embed/srRVUe4_wW4`, in the posted position in `GET /store/gallery`

#### Scenario: Not a YouTube link
- **WHEN** an admin posts a `videos` entry with `url` `https://vimeo.com/12345`
- **THEN** the response is 400, names `url`, and `GET /store/gallery` is unchanged

#### Scenario: Reorder
- **WHEN** an admin posts the existing three videos in reverse order
- **THEN** `GET /store/gallery` returns them in the reversed order

#### Scenario: Remove
- **WHEN** an admin posts the list without one of the videos
- **THEN** it no longer appears in `GET /store/gallery` and the remaining order is unchanged

### Requirement: Content screens in the admin sidebar
The admin dashboard SHALL show one top-level sidebar item per content page and a **Gallery** item, each with its own icon, in the order Gallery, Privacy Policy, Terms & Conditions, Shipping & Returns, About. Each page entry SHALL open a read-only card in the dashboard's record layout: a header with the title and a menu, then rows for the title, meta description and the body rendered as compact formatted text. A page without content SHALL show an empty state instead of the rows. The menu's Edit SHALL open a drawer with the title, description and body prefilled, whose Save persists and confirms with a toast. The Gallery entry SHALL list the videos in display order with their titles and ids in the same layout as the dashboard's Categories page: a header with Edit ranking and Create actions, the table, and a row menu with Edit and Delete. Create and Edit SHALL open a drawer with the YouTube link and title, validated in the drawer the way the dashboard forms are: a missing or non-YouTube link and an empty title show a field error and nothing is posted. Delete SHALL ask for confirmation. Edit ranking SHALL open a full-screen modal listing the videos as drag rows, and a drop SHALL change the position. Each action SHALL persist immediately and confirm or report failure with a toast.

#### Scenario: Editing a page
- **WHEN** an admin opens Privacy Policy, changes the body and saves
- **THEN** a success toast appears and reopening the screen shows the saved body

#### Scenario: Save rejected
- **WHEN** an admin clears the title and saves the drawer
- **THEN** an error toast shows the validation message and the drawer keeps the entered values

#### Scenario: Dragging a video to the top
- **WHEN** an admin opens Edit ranking and drags the second video above the first
- **THEN** a success toast appears and it is first in `GET /store/gallery`

#### Scenario: Editing a video
- **WHEN** an admin opens Edit on a row, changes the title and saves the drawer
- **THEN** the row shows the new title and `GET /store/gallery` returns it
