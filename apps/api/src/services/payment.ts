/**
 * Payment provider abstraction.
 * Current methods: BANK_TRANSFER | INVOICE | MANUAL
 * Add QPay (or others) by implementing PaymentProvider without changing order flow.
 */

export interface PaymentProvider {
  id: string;
  createInvoice(input: {
    orderNumber: string;
    amount: number;
    description: string;
  }): Promise<{ providerRef: string; checkoutUrl?: string }>;
  verify(providerRef: string): Promise<{ paid: boolean }>;
}

export const manualPayment: PaymentProvider = {
  id: "MANUAL",
  async createInvoice(input) {
    return { providerRef: `manual-${input.orderNumber}` };
  },
  async verify() {
    return { paid: false };
  },
};

export function getPaymentProvider(_method: string): PaymentProvider {
  return manualPayment;
}
