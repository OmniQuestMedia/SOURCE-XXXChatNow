# Migration Guide - Legacy Pricing to Rate Card System v2

## Overview

This guide provides step-by-step instructions for migrating from legacy pricing systems to Rate Card System v2. The migration maintains backward compatibility while enabling new features.

## Table of Contents

1. [Pre-Migration Assessment](#pre-migration-assessment)
2. [Migration Phases](#migration-phases)
3. [Legacy System Mapping](#legacy-system-mapping)
4. [Code Examples](#code-examples)
5. [Testing Strategy](#testing-strategy)
6. [Rollback Plan](#rollback-plan)

---

## Pre-Migration Assessment

### Current Legacy Pricing Points

1. **Performer Pricing** (`IPerformer`)
   - `privateCallPrice`: number (tokens per minute)
   - `groupCallPrice`: number (tokens per minute)

2. **Products** (`IProduct`)
   - `token`: number (cost)
   - `type`: 'physical' | 'digital'

3. **Videos** (`IVideo`)
   - `token`: number (cost)
   - `isSaleVideo`: boolean

4. **Galleries** (`IPerformerGallery`)
   - `token`: number (cost)
   - `isSale`: boolean

5. **Photos** (`IPerformerPhoto`)
   - `token`: number (cost)

6. **Token Packages** (`ITokenPackage`)
   - `price`: number (USD)
   - `tokens`: number

7. **Featured Creator Packages** (`IFeaturedCreatorPackage`)
   - `price`: number

### Data Inventory

Before migration, inventory:
- Number of performers with custom pricing
- Number of products (physical/digital)
- Number of galleries/videos with pricing
- Number of active token packages

---

## Migration Phases

### Phase 1: Dual System Operation (Weeks 1-2)

**Objective**: Run both systems in parallel without breaking existing functionality.

**Tasks**:
1. Deploy Rate Card System v2 code (interfaces, services)
2. Keep legacy pricing fields intact
3. Backend reads from legacy, optionally writes to Rate Card
4. Frontend continues using legacy APIs

**Success Criteria**:
- Rate Card APIs available but not required
- No impact on existing transactions
- Rate Card data can be created/read

---

### Phase 2: Gradual Data Migration (Weeks 3-4)

**Objective**: Convert existing pricing to Rate Card format.

**Tasks**:

#### For Performers
```typescript
// Convert performer pricing to rate card
const convertPerformerPricing = async (performer: IPerformer) => {
  const items: IItem[] = [];
  
  if (performer.privateCallPrice) {
    items.push({
      name: "Private Call - Per Minute",
      type: RateCardItemType.TIME_BLOCK,
      price: performer.privateCallPrice,
      currency: "TOKEN",
      status: "active",
      legacyRef: {
        legacyType: "privateCallPrice",
        entityId: performer._id
      }
    });
  }
  
  if (performer.groupCallPrice) {
    items.push({
      name: "Group Call - Per Minute",
      type: RateCardItemType.TIME_BLOCK,
      price: performer.groupCallPrice,
      currency: "TOKEN",
      status: "active",
      legacyRef: {
        legacyType: "groupCallPrice",
        entityId: performer._id
      }
    });
  }
  
  const rateCard: IRateCard = {
    name: `${performer.name || performer.username} - Default Pricing`,
    ownerId: performer._id,
    ownerType: "performer",
    status: "active",
    items
  };
  
  await rateCardService.create(rateCard);
};
```

#### For Products
```typescript
// Convert product to rate card item
const convertProduct = async (product: IProduct) => {
  const item: IItem = {
    name: product.name,
    description: product.description,
    type: product.type === 'physical' 
      ? RateCardItemType.PHYSICAL_PRODUCT 
      : RateCardItemType.DIGITAL_PRODUCT,
    price: product.token,
    currency: "TOKEN",
    status: product.status,
    quantity: product.stock,
    legacyRef: {
      legacyType: "product",
      entityId: product._id
    }
  };
  
  return item;
};
```

#### For Galleries/Videos
```typescript
// Convert gallery to rate card item
const convertGallery = async (gallery: IPerformerGallery) => {
  if (!gallery.isSale) return null; // Free gallery
  
  const item: IItem = {
    name: gallery.name,
    description: gallery.description,
    type: RateCardItemType.PASS,
    price: gallery.token,
    currency: "TOKEN",
    status: gallery.status,
    metadata: {
      contentType: "gallery",
      numPhotos: gallery.numOfItems
    },
    legacyRef: {
      legacyType: "gallery",
      entityId: gallery._id
    }
  };
  
  return item;
};
```

**Success Criteria**:
- All active pricing converted to Rate Card Items
- Legacy and Rate Card data in sync
- Validation scripts show 100% coverage

---

### Phase 3: API Transition (Weeks 5-6)

**Objective**: Frontend starts using Rate Card APIs.

**Tasks**:

#### Update Component for Private Call
```typescript
// OLD WAY
const privateCallPrice = performer.privateCallPrice;

// NEW WAY
const rateCard = await rateCardService.findByPerformerId(performer._id);
const privateCallItem = rateCard.items.find(
  item => item.type === RateCardItemType.TIME_BLOCK 
    && item.name.includes("Private Call")
);
const privateCallPrice = privateCallItem?.price || 0;
```

#### Update Purchase Flow
```typescript
// OLD WAY
await purchaseItemService.purchaseGallery(galleryId);

// NEW WAY
const rateCard = await rateCardService.findByPerformerId(performerId);
const galleryItem = rateCard.items.find(
  item => item.metadata?.contentType === "gallery" 
    && item.legacyRef?.entityId === galleryId
);

await rateCardService.applyItem({
  rateCardId: rateCard._id,
  itemId: galleryItem._id,
  buyerId: currentUser._id,
  sellerId: performerId,
  quantity: 1,
  idempotencyKey: generateIdempotencyKey()
});
```

**Success Criteria**:
- 50% of purchase flows use Rate Card APIs
- Transaction volume stable
- Error rates unchanged or improved

---

### Phase 4: Legacy Deprecation (Weeks 7-8)

**Objective**: Remove dependency on legacy pricing fields.

**Tasks**:
1. All frontend uses Rate Card APIs
2. Backend writes only to Rate Card
3. Legacy fields marked as deprecated
4. Add migration warnings in legacy endpoints

**Success Criteria**:
- 100% of transactions use Rate Card System
- Legacy endpoints show deprecation warnings
- No critical paths depend on legacy data

---

### Phase 5: Legacy Removal (Week 9+)

**Objective**: Clean up legacy code (optional, low priority).

**Tasks**:
1. Remove legacy pricing fields from models
2. Remove legacy service methods
3. Remove legacy API endpoints
4. Archive legacy data

**Success Criteria**:
- Codebase simplified
- Technical debt reduced
- Documentation updated

---

## Legacy System Mapping

### Complete Mapping Table

| Legacy System | Legacy Field | Rate Card Type | Notes |
|---------------|--------------|----------------|-------|
| IPerformer | privateCallPrice | TIME_BLOCK | Per minute pricing |
| IPerformer | groupCallPrice | TIME_BLOCK | Per minute pricing |
| IProduct (physical) | token | PHYSICAL_PRODUCT | Includes shipping |
| IProduct (digital) | token | DIGITAL_PRODUCT | Electronic delivery |
| IVideo | token | PASS | Video access |
| IPerformerGallery | token | PASS | Gallery access |
| IPerformerPhoto | token | PASS | Photo access |
| ITokenPackage | price/tokens | TOKEN_PACKAGE | Platform currency |
| IFeaturedCreatorPackage | price | FEATURED_PLACEMENT | Promotional |
| Tips | N/A | PERFORMANCE_ACTION | Dynamic amount |

---

## Code Examples

### Example 1: Create Rate Card from Scratch

```typescript
import { rateCardService, RateCardItemType } from 'src/services';

const createPerformerRateCard = async (performerId: string) => {
  const rateCard = await rateCardService.create({
    name: "Standard Performer Rates",
    description: "Default pricing for all services",
    ownerId: performerId,
    ownerType: "performer",
    status: "active",
    items: [
      {
        name: "Private Call - Per Minute",
        type: RateCardItemType.TIME_BLOCK,
        price: 10,
        currency: "TOKEN",
        status: "active"
      },
      {
        name: "Group Call - Per Minute",
        type: RateCardItemType.TIME_BLOCK,
        price: 3,
        currency: "TOKEN",
        status: "active"
      }
    ]
  });
  
  return rateCard;
};
```

### Example 2: Purchase with Rate Card

```typescript
const purchaseGalleryAccess = async (
  performerId: string,
  galleryId: string,
  userId: string
) => {
  // 1. Get performer's rate card
  const rateCard = await rateCardService.findByPerformerId(performerId);
  
  // 2. Find gallery item
  const galleryItem = rateCard.items.find(
    item => item.type === RateCardItemType.PASS
      && item.legacyRef?.entityId === galleryId
  );
  
  if (!galleryItem) {
    throw new Error("Gallery not found in rate card");
  }
  
  // 3. Generate idempotency key
  const idempotencyKey = `gallery_${galleryId}_${userId}_${Date.now()}`;
  
  // 4. Apply item (purchase)
  const transaction = await rateCardService.applyItem({
    rateCardId: rateCard._id,
    itemId: galleryItem._id,
    buyerId: userId,
    sellerId: performerId,
    quantity: 1,
    idempotencyKey
  });
  
  return transaction;
};
```

### Example 3: Geo/Demo Pricing

```typescript
const getLocalizedRateCard = async (
  performerId: string,
  userCountry: string
) => {
  // Get rate card with geo/demo filtering
  const rateCard = await rateCardService.findByPerformerId(
    performerId,
    { country: userCountry }
  );
  
  // If no country-specific rate card, fallback to default
  return rateCard;
};
```

---

## Testing Strategy

### Unit Tests (When test infrastructure added)

```typescript
describe('Rate Card Migration', () => {
  it('converts performer pricing to rate card', async () => {
    const performer = {
      _id: 'perf123',
      privateCallPrice: 10,
      groupCallPrice: 3
    };
    
    const rateCard = await convertPerformerPricing(performer);
    
    expect(rateCard.items).toHaveLength(2);
    expect(rateCard.items[0].type).toBe(RateCardItemType.TIME_BLOCK);
    expect(rateCard.items[0].price).toBe(10);
  });
});
```

### Integration Tests

Test scenarios:
1. Create rate card → Purchase item → Verify transaction
2. Legacy purchase → Rate Card purchase → Compare results
3. Multiple rate cards → Verify correct one selected
4. Geo/Demo rules → Verify filtering works

### Manual Testing Checklist

- [ ] Create new performer rate card
- [ ] Purchase gallery using rate card
- [ ] Purchase product using rate card
- [ ] Verify legacy purchases still work
- [ ] Check transaction history
- [ ] Test with different currencies
- [ ] Test Geo/Demo filtering
- [ ] Verify idempotency (retry same purchase)

---

## Rollback Plan

### Quick Rollback (Emergency)

If critical issues arise:

1. **Feature Flag**: Disable Rate Card System
   ```typescript
   const USE_RATE_CARD = false; // Quick disable
   ```

2. **Route Traffic**: Direct all purchases to legacy APIs

3. **Monitor**: Verify legacy system handling load

### Gradual Rollback (Controlled)

If issues are non-critical:

1. Roll back one component at a time
2. Keep Rate Card data intact
3. Fix issues and retry migration

### Data Rollback

Rate Card System is additive, so:
- Legacy data remains untouched during migration
- No data loss risk
- Can restart migration from any phase

---

## Common Issues and Solutions

### Issue: Rate Card Not Found

**Symptom**: API returns 404 when fetching rate card

**Solution**: 
- Check if performer has rate card created
- Verify ownerId matches performer ID
- Run migration script for that performer

### Issue: Price Mismatch

**Symptom**: Rate Card price differs from legacy price

**Solution**:
- Check when legacy price was last updated
- Re-run conversion for that performer/product
- Verify legacyRef points to correct entity

### Issue: Duplicate Transactions

**Symptom**: User charged twice for same item

**Solution**:
- Check idempotency key generation
- Verify backend deduplication logic
- Refund duplicate transaction

---

## Support and Resources

- **Architecture**: See `/docs/ARCHITECTURE.md`
- **Decisions**: See `/docs/DECISIONS.md`
- **Glossary**: See `/docs/DOMAIN_GLOSSARY.md`
- **Code**: See `/src/interfaces/rate-card.ts` and `/src/services/rate-card.service.ts`

---

## Migration Success Metrics

Track these metrics throughout migration:

1. **Coverage**: % of pricing data converted to Rate Card
2. **Transaction Volume**: Rate Card vs Legacy purchases
3. **Error Rate**: Compare before/after migration
4. **Performance**: API response times
5. **Revenue**: Ensure no revenue loss during transition

**Target**: 100% coverage, 0% revenue loss, <1% error rate increase.
