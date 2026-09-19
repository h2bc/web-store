## MODIFIED Requirements

### Requirement: Fixed set of content pages
The system SHALL manage the text of exactly four screens identified by the slugs `privacy`, `terms`, `shipping-returns` and `about`. Each SHALL have an optional title, a meta description and a markdown body. No text SHALL live in application source: the content seed SHALL insert generated placeholder text, with the screen's label as the title, for rows that do not exist and SHALL skip rows that already exist. A screen that has not been seeded or saved SHALL answer 404. Rows SHALL NOT be created or deleted through any endpoint or screen beyond that first save.

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
The store API SHALL expose `GET /store/<slug>`, one route per screen (`/store/privacy`, `/store/terms`, `/store/shipping-returns`, `/store/about`), returning `{ content_page: { slug, title, description, body, updated_at } }` for a known slug with content, where `title` is a string or null. The endpoint SHALL require the publishable API key like every other store endpoint.

#### Scenario: Saved page
- **WHEN** the owner has saved the `terms` page
- **THEN** `GET /store/terms` returns that title, description and body with a non-null `updated_at`

#### Scenario: Page without a title
- **WHEN** the owner has saved the `about` page without a title
- **THEN** `GET /store/about` returns `title` as null

### Requirement: Admin saves a page
The admin API SHALL expose `GET /admin/<slug>`, returning the same shape as the store endpoint, and `POST /admin/<slug>` taking an optional `title` (0 to 120 characters, empty or absent stored as null), `description` (0 to 300 characters) and `body` (1 to 100000 characters). A valid post SHALL create or replace the page's stored content and respond with the saved page. A body that fails validation SHALL be rejected with status 400 naming the field. Both endpoints SHALL require an authenticated admin user.

#### Scenario: First save
- **WHEN** an admin posts a valid title, description and body to `/admin/about`
- **THEN** the response is 200 with the saved page and `GET /store/about` returns the posted content

#### Scenario: Clearing the title
- **WHEN** an admin posts an empty title to a page that had one
- **THEN** the response is 200 and `GET /store/<slug>` returns `title` as null

#### Scenario: Empty body
- **WHEN** an admin posts a body of zero characters
- **THEN** the response is 400 and names `body`

#### Scenario: Unauthenticated
- **WHEN** a request without an admin session or token posts to `/admin/about`
- **THEN** the response is 401 and nothing is saved

### Requirement: Content screens in the admin sidebar
The admin dashboard SHALL show one top-level sidebar item per content page and a **Gallery** item, each with its own icon, in the order Gallery, Privacy Policy, Terms & Conditions, Shipping & Returns, About. Each page entry SHALL open a read-only card in the dashboard's record layout: a header with the screen's label and a menu, then rows for the title, showing a dash when empty, the meta description and the body rendered as compact formatted text. A page without content SHALL show an empty state instead of the rows. The menu's Edit SHALL open a drawer with the title, description and body prefilled, whose Save persists and confirms with a toast; the title MAY be left empty. The Gallery entry SHALL list the videos in display order with their titles and ids in the same layout as the dashboard's Categories page: a header with Edit ranking and Create actions, the table, and a row menu with Edit and Delete. Create and Edit SHALL open a drawer with the YouTube link and title, validated in the drawer the way the dashboard forms are: a missing or non-YouTube link and an empty title show a field error and nothing is posted. Delete SHALL ask for confirmation. Edit ranking SHALL open a full-screen modal listing the videos as drag rows, and a drop SHALL change the position. Each action SHALL persist immediately and confirm or report failure with a toast.

#### Scenario: Editing a page
- **WHEN** an admin opens Privacy Policy, changes the title and the body and saves
- **THEN** a success toast appears and reopening the screen shows the saved title and body

#### Scenario: Clearing the title
- **WHEN** an admin opens a page with a title, clears the Title field and saves
- **THEN** a success toast appears and the card shows a dash in the Title row

#### Scenario: Save rejected
- **WHEN** an admin clears the body and saves the drawer
- **THEN** an error toast shows the validation message and the drawer keeps the entered values

#### Scenario: Dragging a video to the top
- **WHEN** an admin opens Edit ranking and drags the second video above the first
- **THEN** a success toast appears and it is first in `GET /store/gallery`

#### Scenario: Editing a video
- **WHEN** an admin opens Edit on a row, changes the title and saves the drawer
- **THEN** the row shows the new title and `GET /store/gallery` returns it
