/**
 * Rate Card System v2 - Core Interfaces
 *
 * This module defines the canonical commerce layer for all purchasable value
 * in the platform. Rate Cards contain priced Items with Geo/Demo rules.
 */

/**
 * RateCardItemType defines pre-approved item categories
 * These are the only valid types of purchasable items in the system
 */
export enum RateCardItemType {
  /** Performance-based actions (e.g., tips, interactions) */
  PERFORMANCE_ACTION = 'PERFORMANCE_ACTION',
  /** Time-based blocks (e.g., private calls, group calls by minute) */
  TIME_BLOCK = 'TIME_BLOCK',
  /** Access passes (e.g., subscription, gallery access, video access) */
  PASS = 'PASS',
  /** Physical products that require shipping */
  PHYSICAL_PRODUCT = 'PHYSICAL_PRODUCT',
  /** Digital products delivered electronically */
  DIGITAL_PRODUCT = 'DIGITAL_PRODUCT',
  /** Token packages for platform currency */
  TOKEN_PACKAGE = 'TOKEN_PACKAGE',
  /** Featured/sponsored placement */
  FEATURED_PLACEMENT = 'FEATURED_PLACEMENT',
  /** Custom item type for special cases */
  CUSTOM = 'CUSTOM'
}

/**
 * Geographic and demographic targeting rules
 * Used to customize rate cards based on user attributes
 */
export interface IGeoDemo {
  /** ISO country code (e.g., 'US', 'GB', 'CA') */
  country?: string;
  /** Geographic region or state */
  region?: string;
  /** User demographic segment */
  segment?: string;
  /** Minimum age requirement */
  minAge?: number;
  /** Maximum age requirement */
  maxAge?: number;
  /** Custom targeting rules */
  customRules?: Record<string, any>;
}

/**
 * Item is the atomic unit of sale in Rate Card System v2
 * All purchasable value must be represented as an Item
 */
export interface IItem {
  /** Unique identifier for this item */
  _id?: string;
  /** Human-readable name */
  name: string;
  /** Detailed description */
  description?: string;
  /** Item type from pre-approved categories */
  type: RateCardItemType;
  /** Price in tokens or monetary units */
  price: number;
  /** Currency or token type (e.g., 'TOKEN', 'USD') */
  currency: string;
  /** Quantity available (for limited items) */
  quantity?: number;
  /** Geographic/demographic targeting rules */
  geoDemo?: IGeoDemo;
  /** Metadata for additional context */
  metadata?: Record<string, any>;
  /** Legacy system reference for migration */
  legacyRef?: {
    /** Type of legacy pricing (e.g., 'privateCallPrice', 'groupCallPrice') */
    legacyType: string;
    /** Legacy entity ID */
    entityId?: string;
  };
  /** Creation timestamp */
  createdAt?: Date;
  /** Last update timestamp */
  updatedAt?: Date;
  /** Item status */
  status?: 'active' | 'inactive' | 'archived';
}

/**
 * RateCard contains a collection of priced Items
 * This is the canonical pricing structure for all commerce
 */
export interface IRateCard {
  /** Unique identifier for this rate card */
  _id?: string;
  /** Human-readable name */
  name: string;
  /** Detailed description */
  description?: string;
  /** Collection of priced items */
  items: IItem[];
  /** Performer or entity this rate card belongs to */
  ownerId: string;
  /** Owner type (performer, studio, platform) */
  ownerType: 'performer' | 'studio' | 'platform';
  /** Geographic/demographic targeting for entire card */
  geoDemo?: IGeoDemo;
  /** Rate card status */
  status: 'active' | 'inactive' | 'draft';
  /** Priority for resolving multiple applicable rate cards */
  priority?: number;
  /** Effective date range */
  effectiveFrom?: Date;
  effectiveTo?: Date;
  /** Creation timestamp */
  createdAt?: Date;
  /** Last update timestamp */
  updatedAt?: Date;
  /** Created by user ID */
  createdBy?: string;
  /** Last updated by user ID */
  updatedBy?: string;
}

/**
 * Transaction record for Rate Card purchases
 * Ensures idempotency and full traceability
 */
export interface IRateCardTransaction {
  /** Unique transaction identifier */
  _id?: string;
  /** Rate card used for this transaction */
  rateCardId: string;
  /** Item purchased */
  itemId: string;
  /** Buyer user ID */
  buyerId: string;
  /** Seller/performer user ID */
  sellerId: string;
  /** Price at time of purchase */
  price: number;
  /** Currency used */
  currency: string;
  /** Quantity purchased */
  quantity: number;
  /** Total transaction amount */
  totalAmount: number;
  /** Geo/Demo rules applied */
  appliedGeoDemo?: IGeoDemo;
  /** Transaction status */
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  /** Idempotency key to prevent duplicate transactions */
  idempotencyKey: string;
  /** Transaction metadata */
  metadata?: Record<string, any>;
  /** Creation timestamp */
  createdAt?: Date;
  /** Completion timestamp */
  completedAt?: Date;
}

/**
 * Legacy pricing adapter - maps old pricing model to Rate Card System v2
 */
export interface ILegacyPricingAdapter {
  /** Legacy pricing type */
  legacyType: 'privateCallPrice' | 'groupCallPrice' | 'tipMenu' | 'product' | 'gallery' | 'video' | 'tokenPackage' | 'featuredPackage';
  /** Entity ID from legacy system */
  entityId: string;
  /** Converted Item representation */
  item: IItem;
  /** Original legacy price data */
  legacyData?: Record<string, any>;
}
