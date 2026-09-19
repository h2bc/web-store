---
name: task-create
description: "Turn an idea, or what the conversation just settled, into short cards in the BACKLOG stack of the WEB board."
argument-hint: "[idea]"
---

# Create task cards

Writes backlog cards a person can read in a minute. Runs only when the developer asks for it. The only writes are new cards on the WEB board. It never edits, moves or deletes a card, and never touches OpenSpec.

## Input

1. The idea is the argument. With no argument, it is what the conversation settled, such as the end of an `/opsx:explore`.
2. When the idea is unclear, ask one question. Do not research the code to fill a card; deep thinking happens when the card is picked up.

## Split

3. One card is one OpenSpec change: one outcome that ships in one pull request. Work with no code change, like writing page text in the admin, is one card per outcome and says so in its Task.
4. A bigger idea becomes several cards in the order they should be done. A later card names the earlier one in its Context.

## Duplicates

5. `deck_get_boards`, take the board titled `WEB`. `deck_get_stacks` with `status: "open"`.
6. When an open card already covers the idea, show its URL and stop for that card.

## Card

7. Title: the outcome in under 10 words, starting with a verb, like `Make the header sticky`.
8. Description, following `.claude/rules/writing.md`:

   ```markdown
   # Context

   Why this matters and what happens today. At most three sentences.

   # Task

   - The outcome, as what a visitor or the owner can observe.
   - At most five bullets. A decision already made is one bullet.
   ```

9. The card holds no file paths, no implementation steps, no requirements and no task list. Those belong to the OpenSpec change.
10. One label from `deck_get_labels`: `feature`, `bug`, `devops`, `docs`, `tech`, `maintenance` or `art`.
11. Assignee: `erminatorius` for an `art` card, `h3en1x` otherwise.

## Confirm

12. Show every card as title, label, assignee and description. Ask one yes or no question and wait. Apply the requested edits and ask again.

## Create

13. Per card, in order: `deck_create_card` in the stack titled `BACKLOG`, then `deck_assign_label_to_card`, then `deck_assign_user_to_card`.
14. Report each card's full URL.

## Verify

Every confirmed card exists in BACKLOG with one label and one assignee, and its description has only the Context and Task headings.

## CRITICAL

- Never create a card before the developer said yes to that exact card.
- Never create a card an open card already covers.
- Never put more on a card than the template allows.
