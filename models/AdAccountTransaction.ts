import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * AdAccountTransaction
 * --------------------
 * Records *all* money movement for a client’s ad account and
 * their main wallet.  Useful for:
 *   - top-ups from client main balance to a FB ad account
 *   - incoming deposits from the client
 *   - platform commission fees
 *   - refunds or adjustments
 */
const AdAccountTransactionSchema = new Schema(
  {
    /** Facebook Ad Account ID (e.g. act_12345) */
    accountId: { type: String, required: true },

    /** Internal client/user ID (link to your User/Client model) */
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },

    /**
     * Direction / purpose of the transaction.
     *  - incoming: client adds funds to main balance
     *  - outgoing: main balance → FB ad account
     *  - topup:    synonym for outgoing if you prefer
     *  - fee:      platform commission or service charge
     *  - refund:   money returned to client
     */
    type: {
      type: String,
      enum: ["incoming", "outgoing", "topup", "fee", "refund"],
      required: true,
    },

    /** Amount in *cents* for accuracy (e.g. 1099 = $10.99) */
    amount: { type: Number, required: true },

    /** Optional description or admin note */
    note: { type: String },

    /**
     * Commission percentage or fixed value applied to this transaction.
     * Example: 0.05 means 5% platform fee.
     */
    commissionRate: { type: Number, default: 0 },

    /** Actual commission amount (in cents) deducted */
    commissionAmount: { type: Number, default: 0 },

    /**
     * Optional reference to a top-up method (bank, Stripe, etc.)
     * so you can group/fee by method.
     */
    method: {
      type: String,
      enum: ["stripe", "paypal", "bank_transfer", "cash", "other"],
      default: "other",
    },

    /** True if this transaction is part of the client’s main-wallet ledger */
    affectsMainBalance: { type: Boolean, default: true },

    /** Optional foreign key to a related order/request document */
    requestId: { type: Schema.Types.ObjectId, ref: "TopupRequest" },
  },
  {
    timestamps: true, // adds createdAt / updatedAt
  }
);

/**
 * Indexes
 * -------
 * - Speed up common lookups:
 *   * All transactions for a client
 *   * All transactions for an ad account
 */
AdAccountTransactionSchema.index({ clientId: 1, createdAt: -1 });
AdAccountTransactionSchema.index({ accountId: 1, createdAt: -1 });

export default mongoose.models.AdAccountTransaction ||
  mongoose.model("AdAccountTransaction", AdAccountTransactionSchema);
