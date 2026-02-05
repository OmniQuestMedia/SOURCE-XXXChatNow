# Rate Card System v2 - Architecture Documentation

## Overview

The Rate Card System v2 is the canonical commerce layer for all purchasable value in the XXXChatNow platform. It provides a unified, extensible pricing model that replaces legacy token-based pricing systems with a more flexible, rule-based approach.

## Core Concepts

### 1. **Item** - Atomic Unit of Sale

An `Item` represents the fundamental unit of commerce in the system. Every purchasable entity must be represented as an Item.

**Key Properties:**
- `name` and `description`: Human-readable information
- `type`: Pre-approved category from `RateCardItemType` enum
- `price` and `currency`: Pricing information
- `geoDemo`: Geographic/demographic targeting rules
- `legacyRef`: Reference to legacy pricing for migration

**Example:**
```typescript
{
  name: "Private Call - 1 Minute",
  type: RateCardItemType.TIME_BLOCK,
  price: 10,
  currency: "TOKEN",
  geoDemo: { country: "US" }
}
```

### 2. **RateCard** - Container for Priced Items

A `RateCard` is a collection of Items owned by a performer, studio, or platform. It serves as a pricing catalog with optional geographic/demographic targeting.

**Key Properties:**
- `name` and `description`: Rate card identification
- `items`: Array of priced Items
- `ownerId` and `ownerType`: Ownership information
- `geoDemo`: Overall targeting rules
- `status`: active, inactive, or draft
- `priority`: For resolving multiple applicable rate cards
- `effectiveFrom/To`: Temporal validity

**Example:**
```typescript
{
  name: "Premium Performer Rate Card",
  ownerId: "performer123",
  ownerType: "performer",
  status: "active",
  items: [
    { name: "Private Call", type: TIME_BLOCK, price: 15, currency: "TOKEN" },
    { name: "Group Call", type: TIME_BLOCK, price: 5, currency: "TOKEN" }
  ],
  priority: 10
}
```

### 3. **RateCardItemType** - Pre-Approved Categories

The `RateCardItemType` enum defines the allowed categories for Items:

- `PERFORMANCE_ACTION`: Tips, interactions, specific actions
- `TIME_BLOCK`: Private calls, group calls (priced per minute/hour)
- `PASS`: Gallery access, video access, subscriptions
- `PHYSICAL_PRODUCT`: Merchandise requiring shipping
- `DIGITAL_PRODUCT`: Digital downloads, content
- `TOKEN_PACKAGE`: Platform currency packages
- `FEATURED_PLACEMENT`: Promoted listings, sponsorships
- `CUSTOM`: Special cases requiring approval

### 4. **GeoDemo Rules** - Targeting and Customization

`IGeoDemo` interface allows rate cards to be customized based on user attributes:

- `country`: ISO country code
- `region`: State/province
- `segment`: User demographic segment
- `minAge/maxAge`: Age restrictions
- `customRules`: Extensible key-value rules

**Example:**
```typescript
{
  country: "US",
  segment: "premium",
  minAge: 21
}
```

## Architecture Layers

### Data Layer
- **Interfaces**: `/src/interfaces/rate-card.ts`
  - Core domain models: `IItem`, `IRateCard`, `IGeoDemo`, `IRateCardTransaction`
  - Enums: `RateCardItemType`
  - Adapters: `ILegacyPricingAdapter`

### Service Layer
- **Service**: `/src/services/rate-card.service.ts`
  - CRUD operations for rate cards and items
  - Geo/Demo validation
  - Transaction handling with idempotency
  - Legacy pricing conversion

### Key Methods:
```typescript
// Fetch rate card for a performer with geo/demo filtering
rateCardService.findByPerformerId(performerId, geoDemo)

// Apply an item (purchase/transaction)
rateCardService.applyItem({
  rateCardId, itemId, buyerId, sellerId,
  quantity, idempotencyKey, geoDemo
})

// Convert legacy pricing to Rate Card Item
rateCardService.convertLegacyPricing({
  legacyType: 'privateCallPrice',
  entityId: performerId,
  price: 10,
  currency: 'TOKEN'
})
```

## Legacy System Integration

### Current Legacy Pricing Points

1. **Performer Pricing**:
   - `privateCallPrice`: Tokens per minute for private calls
   - `groupCallPrice`: Tokens per minute for group calls

2. **Content Pricing**:
   - Products: `token` field (physical/digital products)
   - Videos: `token` field (video access)
   - Galleries: `token` field (gallery access)
   - Photos: `token` field (photo access)

3. **Platform Packages**:
   - Token Packages: `ITokenPackage` with price/tokens
   - Featured Creator Packages: `IFeaturedCreatorPackage`

### Migration Strategy

The Rate Card System v2 maintains **backward compatibility** through:

1. **Legacy Reference**:
   ```typescript
   legacyRef: {
     legacyType: 'privateCallPrice',
     entityId: 'performer123'
   }
   ```

2. **Adapter Layer**:
   - `ILegacyPricingAdapter` interface
   - `convertLegacyPricing()` service method
   - Automatic mapping from legacy formats

3. **Dual Mode Operation**:
   - Phase 1: Rate Card System runs alongside legacy
   - Phase 2: Gradual migration of pricing data
   - Phase 3: Legacy system deprecated

## Transaction Management

### Idempotency

All transactions require an `idempotencyKey` to prevent duplicate charges:

```typescript
const transaction = await rateCardService.applyItem({
  rateCardId: 'rc_123',
  itemId: 'item_456',
  buyerId: 'user_789',
  sellerId: 'performer_123',
  quantity: 1,
  idempotencyKey: 'txn_' + Date.now() + '_' + Math.random()
});
```

### Traceability

Every transaction is fully traceable:
- Transaction ID
- Rate card and item references
- Buyer and seller IDs
- Applied Geo/Demo rules
- Timestamps (created, completed)
- Status tracking

### Transaction Lifecycle

```
pending → completed
        → failed
        → refunded
```

## Geo/Demo Rule Validation

### Validation Flow

1. User initiates purchase
2. System retrieves user context (country, age, segment, etc.)
3. Rate Card Geo/Demo rules are evaluated
4. If rules match, transaction proceeds
5. If rules don't match, alternative rate card or default pricing applied

### Rule Priority

When multiple rate cards are applicable:
1. Most specific Geo/Demo match wins
2. Higher `priority` value wins
3. Most recent `effectiveFrom` wins

## Security and Financial Integrity

### Immutable Pricing

Once a transaction is created, the price is locked:
- Price at transaction time is recorded
- Rate card changes don't affect historical transactions
- Full audit trail maintained

### Validation

- All items must have valid `RateCardItemType`
- All prices must be positive
- All transactions require authentication
- Geo/Demo rules validated server-side

## Future Enhancements

### Planned Features

1. **Dynamic Pricing**: Time-based, demand-based pricing
2. **Bulk Discounts**: Quantity-based pricing tiers
3. **Promotional Codes**: Coupon/discount integration
4. **Subscription Tiers**: Recurring billing with Rate Cards
5. **A/B Testing**: Multiple rate cards for experiments
6. **Analytics Dashboard**: Revenue tracking, conversion metrics

### API Extensions

- GraphQL API for flexible queries
- Webhooks for transaction events
- Rate card templates for quick setup
- Automated migration tools

## Appendix

### Type Definitions

See `/src/interfaces/rate-card.ts` for complete type definitions.

### Service API

See `/src/services/rate-card.service.ts` for API methods.

### Example Use Cases

1. **Setting Performer Pricing**:
   - Create rate card for performer
   - Add TIME_BLOCK items for private/group calls
   - Set Geo/Demo rules if needed

2. **Purchasing Gallery Access**:
   - Fetch performer's rate card
   - Find PASS item for gallery
   - Apply item with idempotency key

3. **Legacy Migration**:
   - Call convertLegacyPricing for each legacy price point
   - Create Items from converted data
   - Add Items to performer's rate card
