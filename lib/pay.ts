import { convert } from './format';
import { PRODUCTS, type Product } from './mock-data';

/* Shared by the checkout UI and the /api/pay routes, so both sides agree on the price. */

export const PAY_METHODS = ['Paystack', 'MoMo', 'Card'] as const;
export type PayMethod = (typeof PAY_METHODS)[number];

/** What Paystack charges, in kobo (NGN). Products priced in other currencies are converted at the demo rate. */
export const toKobo = (p: Product) => Math.round(convert(p.price.amount, p.price.currency, 'NGN') * 100);

export const findProduct = (id: unknown, handle: unknown) => PRODUCTS.find((p) => p.id === id && p.handle === handle);
