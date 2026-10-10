declare module '@paystack/inline-js' {
  interface PaystackTransaction {
    reference: string
    status: string
    trans: string
    transaction: string
    message: string
  }

  interface NewTransactionOptions {
    key: string
    email: string
    amount: number
    firstName?: string
    lastName?: string
    phone?: string
    ref?: string
    currency?: string
    metadata?: Record<string, unknown>
    onSuccess?: (transaction: PaystackTransaction) => void
    onCancel?: () => void
    onError?: (error: { message: string }) => void
  }

  export default class PaystackPop {
    newTransaction(options: NewTransactionOptions): void
  }
}
