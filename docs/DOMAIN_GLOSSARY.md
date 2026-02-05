# Domain Glossary - Rate Card System v2

## Canonical Terminology

This document defines the authoritative naming and concepts for the Rate Card System v2. All code, documentation, and communication must use these terms consistently.

---

## Core Entities

### Rate Card
**Definition**: A collection of priced Items owned by a performer, studio, or platform. Serves as a pricing catalog with optional geographic/demographic targeting.

**Usage**: "The performer's rate card contains items for private calls and gallery access."

**NOT**: "price list", "pricing menu", "price sheet"

---

### Item
**Definition**: The atomic unit of sale. Every purchasable entity in the platform is represented as an Item.

**Usage**: "This Item represents a 1-minute private call priced at 10 tokens."

**NOT**: "product", "offering", "service", "listing"

---

### RateCardItemType
**Definition**: Pre-approved category for an Item. Controls what types of purchases are allowed.

**Values**:
- PERFORMANCE_ACTION
- TIME_BLOCK
- PASS
- PHYSICAL_PRODUCT
- DIGITAL_PRODUCT
- TOKEN_PACKAGE
- FEATURED_PLACEMENT
- CUSTOM

**Usage**: "This Item has type TIME_BLOCK because it's priced per minute."

**NOT**: "item category", "product type"

---

### GeoDemo (Geographic/Demographic Rules)
**Definition**: Targeting rules that customize rate cards based on user attributes like location, age, or segment.

**Usage**: "This rate card has GeoDemo rules restricting it to users in the US."

**NOT**: "targeting rules", "geo rules", "demographic filters"

---

## Pricing Concepts

### Price
**Definition**: The cost of an Item in tokens or monetary units.

**Usage**: "The price is 10 tokens."

**NOT**: "cost", "rate", "fee", "charge" (except in specific contexts)

---

### Currency
**Definition**: The unit of value (TOKEN, USD, EUR, etc.).

**Usage**: "The currency for this Item is TOKEN."

**NOT**: "token type", "money type"

---

### Legacy Pricing
**Definition**: Pricing from the old system (privateCallPrice, groupCallPrice, product tokens, etc.).

**Usage**: "We converted legacy pricing to Rate Card Items using the adapter."

**NOT**: "old prices", "historical prices"

---

## Ownership

### Owner
**Definition**: The entity (performer, studio, or platform) that owns a rate card.

**Usage**: "The owner of this rate card is performer ID 12345."

**NOT**: "creator", "author", "merchant"

---

### OwnerType
**Definition**: The category of owner: 'performer', 'studio', or 'platform'.

**Usage**: "The ownerType is 'performer' for performer-owned rate cards."

**NOT**: "owner category", "entity type"

---

## Transaction Terms

### Transaction
**Definition**: A record of a purchase using a Rate Card Item.

**Usage**: "The transaction was completed successfully."

**NOT**: "purchase", "sale", "order" (except for physical products)

---

### Idempotency Key
**Definition**: A unique identifier to prevent duplicate transactions.

**Usage**: "Every transaction requires an idempotency key."

**NOT**: "transaction ID", "unique key", "dedup key"

---

### Buyer
**Definition**: The user purchasing an Item.

**Usage**: "The buyer is user ID 789."

**NOT**: "customer", "purchaser", "client"

---

### Seller
**Definition**: The performer or entity receiving payment for an Item.

**Usage**: "The seller is performer ID 123."

**NOT**: "vendor", "merchant", "provider"

---

## Status Terms

### Active
**Definition**: A rate card or item that is currently available for purchase.

**Usage**: "This rate card is active."

---

### Inactive
**Definition**: A rate card or item that is temporarily unavailable but may be reactivated.

**Usage**: "This item is inactive and won't appear in listings."

---

### Draft
**Definition**: A rate card or item that is being prepared but not yet available.

**Usage**: "This rate card is in draft status for testing."

---

### Archived
**Definition**: A rate card or item that has been retired and won't be reactivated.

**Usage**: "Old rate cards are archived for record-keeping."

---

## Integration Terms

### Legacy Reference (legacyRef)
**Definition**: A link between a Rate Card Item and its source in the legacy pricing system.

**Usage**: "The legacyRef points to privateCallPrice in the performer model."

**NOT**: "old reference", "historical link"

---

### Adapter
**Definition**: Code that converts legacy pricing to Rate Card format.

**Usage**: "The adapter converts performer prices to Rate Card Items."

**NOT**: "converter", "transformer", "mapper"

---

## Temporal Terms

### Effective From
**Definition**: The date/time when a rate card becomes valid.

**Usage**: "This rate card is effective from January 1, 2026."

---

### Effective To
**Definition**: The date/time when a rate card expires.

**Usage**: "This rate card is effective to December 31, 2026."

---

## Rule Terms

### Priority
**Definition**: A number determining which rate card wins when multiple apply.

**Usage**: "The promotional rate card has higher priority than the default."

**NOT**: "weight", "rank", "order"

---

### Validation
**Definition**: The process of checking if GeoDemo rules allow a transaction.

**Usage**: "Validation ensures the user meets age requirements."

**NOT**: "checking", "verification"

---

## API Terms

### Search
**Definition**: Listing rate cards with optional filters.

**Usage**: "Search for rate cards by performer ID."

---

### Find
**Definition**: Retrieving a specific rate card or item by ID.

**Usage**: "Find the rate card with ID rc_123."

---

### Apply
**Definition**: Executing a purchase using a Rate Card Item.

**Usage**: "Apply this item to complete the purchase."

**NOT**: "execute", "purchase", "buy"

---

## Metadata Terms

### Metadata
**Definition**: Extensible key-value data for feature-specific information.

**Usage**: "Store video duration in the item metadata."

**NOT**: "extra data", "additional fields", "custom data"

---

## Quantity Terms

### Quantity
**Definition**: The number of items available or being purchased.

**Usage**: "The quantity is 100 for limited edition items."

---

## Deprecated Terms

These terms should NOT be used:

- ❌ "Chip menu" → Use "Rate Card" or "Items"
- ❌ "Tip menu" → Use "Performance Action Items"
- ❌ "Booking menu" → Use "Rate Card"
- ❌ "Price list" → Use "Rate Card"
- ❌ "Product" (generic) → Use "Item" (specific type: PHYSICAL_PRODUCT or DIGITAL_PRODUCT)
- ❌ "Service" → Use "Item" (specific type: TIME_BLOCK or PERFORMANCE_ACTION)
- ❌ "Offering" → Use "Item"

---

## Naming Conventions

### Code
- Interfaces: Prefix with `I` (e.g., `IRateCard`, `IItem`)
- Enums: No prefix (e.g., `RateCardItemType`)
- Services: Suffix with `Service` (e.g., `RateCardService`)

### API Endpoints
- Collection: `/rate-card/search`
- Single resource: `/rate-card/{id}`
- Actions: `/rate-card/apply-item`

### Database/Models
- Collections: Plural (e.g., `rateCards`, `items`)
- Fields: camelCase (e.g., `ownerId`, `effectiveFrom`)

---

## Examples in Context

### ✅ Correct Usage
```typescript
// Create a rate card with time block items
const rateCard: IRateCard = {
  name: "Premium Rate Card",
  ownerId: "performer123",
  ownerType: "performer",
  status: "active",
  items: [
    {
      name: "Private Call - 1 Minute",
      type: RateCardItemType.TIME_BLOCK,
      price: 10,
      currency: "TOKEN"
    }
  ]
};

// Apply an item with idempotency
await rateCardService.applyItem({
  rateCardId: "rc_123",
  itemId: "item_456",
  buyerId: "user_789",
  sellerId: "performer_123",
  idempotencyKey: "txn_unique_key"
});
```

### ❌ Incorrect Usage
```typescript
// DON'T use deprecated terms
const priceList = { ... }; // Should be: rateCard
const product = { type: "service" }; // Should be: item with type: TIME_BLOCK
const merchant = "performer123"; // Should be: seller or ownerId
```

---

## Change Process

To add or modify terminology:
1. Propose change in architecture discussion
2. Document decision in DECISIONS.md
3. Update this glossary
4. Update code and documentation
5. Announce in team communication

**Authority**: This glossary is the single source of truth for Rate Card System v2 terminology.
