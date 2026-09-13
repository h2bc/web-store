## MODIFIED Requirements

### Requirement: Content screens in the admin sidebar
The admin dashboard SHALL show one top-level sidebar item per content page and a **Gallery** item, each with its own icon, in the order Gallery, Privacy Policy, Terms & Conditions, Shipping & Returns, About. Each page entry SHALL open a read-only card in the dashboard's record layout: a header with the screen's label and a menu, then rows for the title, showing a dash when empty, the meta description and the body rendered as compact formatted text. A page without content SHALL show an empty state instead of the rows. The menu's Edit SHALL open a drawer with the title, description and body prefilled, validated in the drawer the way the dashboard forms are: a body of zero characters, a description over 300 characters or a title over 120 characters shows a field error, keeps the entered values and nothing is posted; a valid Save persists and confirms with a toast. The Gallery entry SHALL list the videos in display order with their titles and ids in the same layout as the dashboard's Categories page: a header with Edit ranking and Create actions, the table, and a row menu with Edit and Delete. A gallery without videos SHALL show the dashboard's empty state with the Create action. Create and Edit SHALL open a drawer with the YouTube link and title, validated in the drawer the way the dashboard forms are: a missing or non-YouTube link and an empty title show a field error and nothing is posted. Delete SHALL ask for confirmation. Edit ranking SHALL open a full-screen modal listing the videos as drag rows, and a drop SHALL change the position. Each action SHALL persist immediately and confirm or report failure with a toast.

#### Scenario: Editing a page
- **WHEN** an admin opens Privacy Policy, changes the body and saves
- **THEN** a success toast appears and reopening the screen shows the saved body

#### Scenario: Editing a description
- **WHEN** an admin opens About, changes the meta description and saves
- **THEN** a success toast appears and the card shows the new description

#### Scenario: Save rejected
- **WHEN** an admin clears the body and saves the drawer
- **THEN** a field error appears under the body, the drawer stays open with the entered values and nothing is posted

#### Scenario: Empty gallery
- **WHEN** an admin opens Gallery and no video exists
- **THEN** the empty state is shown with the Create action and no table

#### Scenario: Dragging a video to the top
- **WHEN** an admin opens Edit ranking and drags the second video above the first
- **THEN** a success toast appears and it is first in `GET /store/gallery`

#### Scenario: Editing a video
- **WHEN** an admin opens Edit on a row, changes the title and saves the drawer
- **THEN** the row shows the new title and `GET /store/gallery` returns it
