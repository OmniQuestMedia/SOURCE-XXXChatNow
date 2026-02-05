# Rate Card System v2 - Architectural Decision Records

## ADR-001: Item as Atomic Unit of Sale

**Date**: 2026-02-05

**Status**: Accepted

**Context**: 
The platform had multiple disconnected pricing systems (token-based pricing for calls, product pricing, gallery pricing, etc.). There was no unified way to represent purchasable value.

**Decision**: 
Adopt `Item` as the atomic unit of sale. Every purchasable entity in the platform must be representable as an Item with a standardized schema.

**Consequences**:
- ✅ Unified commerce layer across all features
- ✅ Easier to add new purchasable items
- ✅ Simplified transaction tracking
- ⚠️ Requires migration of legacy pricing data
- ⚠️ All new features must use Item model

---

## ADR-002: RateCardItemType Enum for Type Safety

**Date**: 2026-02-05

**Status**: Accepted

**Context**: 
Without a controlled vocabulary, different parts of the system could create incompatible item types, leading to data inconsistency.

**Decision**: 
Define `RateCardItemType` enum with pre-approved categories. All Items must use one of these types.

**Consequences**:
- ✅ Type safety and validation
- ✅ Clear categorization of purchasable items
- ✅ Easier reporting and analytics
- ⚠️ New types require code changes (intentional friction)

**Approved Types**:
- PERFORMANCE_ACTION
- TIME_BLOCK
- PASS
- PHYSICAL_PRODUCT
- DIGITAL_PRODUCT
- TOKEN_PACKAGE
- FEATURED_PLACEMENT
- CUSTOM (escape hatch)

---

## ADR-003: Geo/Demo Rule System

**Date**: 2026-02-05

**Status**: Accepted

**Context**: 
Different users may see different prices based on location, demographics, or segment. Hard-coding these rules would be inflexible.

**Decision**: 
Implement `IGeoDemo` interface for flexible targeting rules. Rules can be attached to individual Items or entire Rate Cards.

**Consequences**:
- ✅ Regional pricing support
- ✅ Demographic-based customization
- ✅ Compliance with local regulations (age restrictions)
- ⚠️ Complexity in rule evaluation
- ⚠️ Requires user context data

---

## ADR-004: Backward Compatibility with Legacy Pricing

**Date**: 2026-02-05

**Status**: Accepted

**Context**: 
The platform has extensive existing pricing data (performer prices, product prices, etc.). A hard cutover would be risky and disruptive.

**Decision**: 
Maintain backward compatibility through:
1. `legacyRef` field on Items
2. `ILegacyPricingAdapter` interface
3. Dual-mode operation during transition
4. Conversion utilities in service layer

**Consequences**:
- ✅ Gradual migration path
- ✅ No downtime required
- ✅ Easier testing and validation
- ⚠️ Increased code complexity during transition
- ⚠️ Need to maintain both systems temporarily

---

## ADR-005: Idempotency Keys for Transactions

**Date**: 2026-02-05

**Status**: Accepted

**Context**: 
Network failures and retries could cause duplicate charges. Users must never be charged twice for the same action.

**Decision**: 
Require `idempotencyKey` for all transaction operations. The backend deduplicates based on this key.

**Consequences**:
- ✅ Prevents duplicate charges
- ✅ Safe retry logic
- ✅ Better user experience
- ⚠️ Clients must generate unique keys
- ⚠️ Backend must track keys (storage cost)

**Implementation**:
```typescript
idempotencyKey: 'txn_' + Date.now() + '_' + userId + '_' + Math.random()
```

---

## ADR-006: Rate Card Ownership Model

**Date**: 2026-02-05

**Status**: Accepted

**Context**: 
Rate cards could be owned by performers, studios, or the platform. The ownership determines who gets paid and who can edit.

**Decision**: 
Use `ownerId` and `ownerType` fields with enum values: 'performer', 'studio', 'platform'.

**Consequences**:
- ✅ Clear ownership model
- ✅ Supports multi-tenant scenarios
- ✅ Revenue attribution is explicit
- ⚠️ Requires ownership validation in API

---

## ADR-007: Priority-Based Rate Card Resolution

**Date**: 2026-02-05

**Status**: Accepted

**Context**: 
A performer might have multiple rate cards (e.g., default, promotional, geographic-specific). The system needs rules to pick the right one.

**Decision**: 
Use `priority` field combined with Geo/Demo specificity and `effectiveFrom/To` dates.

**Resolution Order**:
1. Most specific Geo/Demo match
2. Higher priority value
3. Most recent effective date

**Consequences**:
- ✅ Flexible pricing strategies
- ✅ Promotional campaigns possible
- ✅ Geographic customization
- ⚠️ Complex resolution logic
- ⚠️ Need clear documentation for users

---

## ADR-008: Currency Field for Multi-Currency Support

**Date**: 2026-02-05

**Status**: Accepted

**Context**: 
The platform currently uses tokens as virtual currency, but may need to support real currency (USD, EUR) or multiple token types in the future.

**Decision**: 
Add explicit `currency` field to Items (e.g., 'TOKEN', 'USD', 'EUR').

**Consequences**:
- ✅ Future-proofed for real currency
- ✅ Multi-token economy possible
- ✅ Clear pricing in API responses
- ⚠️ Need currency conversion logic
- ⚠️ Financial compliance considerations

---

## ADR-009: Status-Based Item Lifecycle

**Date**: 2026-02-05

**Status**: Accepted

**Context**: 
Items need to go through states: draft → active → inactive/archived. This allows testing and controlled rollout.

**Decision**: 
Implement `status` field with values: 'active', 'inactive', 'draft', 'archived'.

**Lifecycle**:
```
draft → active → inactive → archived
      ↓          ↓
      (can revert)
```

**Consequences**:
- ✅ Safe testing of new items
- ✅ Temporary item disabling
- ✅ Historical data preservation
- ⚠️ Need to filter by status in queries

---

## ADR-010: Metadata Field for Extensibility

**Date**: 2026-02-05

**Status**: Accepted

**Context**: 
Different item types may need additional data that doesn't fit the core schema (e.g., video duration for TIME_BLOCK items).

**Decision**: 
Add `metadata: Record<string, any>` field to Items and Rate Cards.

**Consequences**:
- ✅ Extensible without schema changes
- ✅ Feature-specific data storage
- ✅ Faster iteration
- ⚠️ Less type safety
- ⚠️ Need validation in application layer

---

## ADR-011: Service Layer Architecture

**Date**: 2026-02-05

**Status**: Accepted

**Context**: 
The codebase uses a service-oriented architecture with `APIRequest` base class.

**Decision**: 
Create `RateCardService` extending `APIRequest` for all Rate Card operations. This maintains consistency with existing patterns.

**Consequences**:
- ✅ Consistent with existing codebase
- ✅ Familiar patterns for developers
- ✅ Reuses existing infrastructure (auth, error handling)
- ⚠️ Coupled to API endpoint structure

---

## ADR-012: TypeScript Interfaces Over Classes

**Date**: 2026-02-05

**Status**: Accepted

**Context**: 
The codebase is TypeScript with a preference for interfaces over classes for data models.

**Decision**: 
Define Rate Card entities as TypeScript interfaces, not classes.

**Consequences**:
- ✅ Lightweight data structures
- ✅ Compatible with JSON serialization
- ✅ Consistent with existing code
- ⚠️ No built-in validation or methods

---

## ADR-013: No Embedded Business Logic in Interfaces

**Date**: 2026-02-05

**Status**: Accepted

**Context**: 
Interfaces should be pure data contracts. Business logic should live in services or utilities.

**Decision**: 
Keep interfaces as plain data structures. Business logic (validation, rules evaluation, pricing calculations) in service layer.

**Consequences**:
- ✅ Clean separation of concerns
- ✅ Easier to test business logic
- ✅ Interfaces can be shared with backend
- ⚠️ Need utility functions for complex operations

---

## ADR-014: Test Strategy

**Date**: 2026-02-05

**Status**: Accepted

**Context**: 
The codebase does not have automated test infrastructure. Adding tests would require significant setup.

**Decision**: 
Given the "minimal changes" requirement and lack of existing test infrastructure, rely on:
1. TypeScript type checking
2. ESLint validation
3. Manual testing of key flows
4. Documentation of expected behavior

**Consequences**:
- ✅ Minimal scope, faster delivery
- ✅ Consistent with existing practice
- ⚠️ No automated regression testing
- ⚠️ Manual QA required

**Future**: When test infrastructure is added, prioritize:
- Rate card CRUD operations
- Geo/Demo rule evaluation
- Legacy pricing conversion
- Transaction idempotency

---

## ADR-015: Documentation as Code

**Date**: 2026-02-05

**Status**: Accepted

**Context**: 
Documentation should be versioned alongside code and easy to update.

**Decision**: 
Store documentation in `/docs` directory as Markdown files. Include inline JSDoc comments in code.

**Consequences**:
- ✅ Documentation versioned with code
- ✅ Easier to keep in sync
- ✅ Accessible to all developers
- ⚠️ Need discipline to update

---

## Future Decisions (Pending)

### FD-001: Rate Card UI Components
**Status**: Deferred  
Decision needed on React components for rate card management.

### FD-002: Rate Card Analytics
**Status**: Deferred  
Decision needed on metrics, dashboards, and reporting.

### FD-003: Rate Card Templates
**Status**: Deferred  
Decision needed on pre-built templates for common scenarios.

### FD-004: Automated Migration Tools
**Status**: Deferred  
Decision needed on tools to migrate legacy pricing data.
