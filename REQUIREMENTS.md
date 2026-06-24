# Task Requirements: Flash-Sale Store

## The Task
Build a flash-sale store. Items have limited stock. Users browse, pick items, and check out.

## Requirements
1. Users log in (a name is enough — don't build real auth).
2. Stock is limited and **must never go negative or oversell**.
3. **Decrement stock the moment an item is added to the cart**, so users see accurate availability.
4. Show everyone the live remaining count.
5. Users can buy multiple items.
6. Frontend:
   - Display the store data from the server in a usable UI.
   - Support the full flow: browse, checkout, errors, successful purchase.
