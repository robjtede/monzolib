import { format, parseISO } from 'date-fns'

import { Amount } from './Amount'
import { Attachment, MonzoAttachmentResponse } from './Attachment'
import { Merchant, MonzoMerchantResponse } from './Merchant'
import { MonzoRequest } from './api'
import { Json } from './helpers'

export class Transaction {
  constructor(private readonly tx: MonzoTransactionResponse) {}

  get amount(): Amount {
    const domestic = {
      amount: this.tx.amount,
      currency: this.tx.currency,
    }

    // if foreign currency
    if (this.tx.currency !== this.tx.local_currency) {
      const local = {
        amount: this.tx.local_amount,
        currency: this.tx.local_currency,
      }

      return new Amount({ domestic, local })
    } else {
      return new Amount({ domestic })
    }
  }

  get attachments(): Attachment[] {
    if (this.tx.attachments) {
      return this.tx.attachments.map(att => new Attachment(att))
    } else {
      return []
    }
  }

  get balance(): Amount {
    const domestic = {
      amount: this.tx.account_balance,
      currency: this.tx.currency,
    }

    return new Amount({ domestic })
  }

  get category() {
    let raw = this.tx.category
    raw = raw.replace('mondo', 'monzo')

    let formatted = raw
    formatted = formatted.replace('_', ' ')

    return {
      raw,
      formatted,
      toString: (): string => raw,
    }
  }

  get counterparty(): MonzoCounterpartyResponse {
    return this.tx.counterparty
  }

  get created(): Date {
    return parseISO(this.tx.created)
  }

  get declined(): boolean {
    return 'decline_reason' in this.tx
  }

  get declineReason(): string | undefined {
    if (!this.declined) return undefined

    return this.tx.decline_reason
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace('cvc', 'CVC')
  }

  get description(): string {
    return this.tx.description
  }

  get displayName(): string {
    if (this.counterparty && 'name' in this.counterparty) {
      return this.counterparty.name
    } else if (
      this.merchant &&
      typeof this.merchant !== 'string' &&
      'name' in this.merchant
    ) {
      return this.merchant.name
    } else {
      return this.description
    }
  }

  get displaySub(): string {
    if (this.is.pot_withdraw) {
      return 'Withdrawn from pot'
    } else if (this.is.pot_deposit) {
      return 'Added to pot'
    } else if (this.declined) {
      return this.declineReason as string
    } else {
      return this.notes.short.trim()
    }
  }

  get hidden(): boolean {
    return 'monux_hidden' in this.tx.metadata
      ? this.tx.metadata.monux_hidden === 'true'
      : false
  }

  get icon(): string {
    if ('is_topup' in this.tx.metadata && this.tx.metadata.is_topup) {
      return './assets/icons/topup.png'
    } else if (
      typeof this.merchant !== 'string' &&
      this.merchant &&
      'logo' in this.merchant &&
      this.merchant.logo
    ) {
      return this.merchant.logo
    } else if (this.tx.counterparty && 'user_id' in this.tx.counterparty) {
      return './assets/icons/peer.png'
    } else return this.iconFallback
  }

  get iconFallback(): string {
    return `./assets/icons/${this.category}.png`
  }

  get id(): string {
    return this.tx.id
  }

  get is(): { [feature: string]: boolean } {
    const cash = String(this.category) === 'cash'
    const zero = this.tx.amount === 0

    const metaAction = zero && !this.inSpending
    const pot = this.tx.scheme === 'uk_retail_pot'
    const pot_deposit = 'pot_deposit_id' in this.tx.metadata
    const pot_withdraw = 'pot_withdrawal_id' in this.tx.metadata
    const auto_coin_jar =
      this.tx.metadata && this.tx.metadata.trigger === 'coin_jar'
    const rounded =
      this.tx.metadata && 'coin_jar_transaction' in this.tx.metadata

    return {
      metaAction,
      cash,
      zero,
      pot,
      pot_deposit,
      pot_withdraw,
      auto_coin_jar,
      rounded,
    }
  }

  get inSpending(): boolean {
    return this.tx.include_in_spending || false
  }

  get location(): string {
    if (
      'merchant' in this.tx &&
      typeof this.tx.merchant !== 'string' &&
      this.tx.merchant &&
      'online' in this.tx.merchant &&
      this.tx.merchant.online
    ) {
      return 'Online'
    } else if (
      'merchant' in this.tx &&
      typeof this.tx.merchant !== 'string' &&
      this.tx.merchant &&
      'address' in this.tx.merchant &&
      this.tx.merchant.address &&
      'short_formatted' in this.tx.merchant.address &&
      this.tx.merchant.address.short_formatted
    ) {
      return this.tx.merchant.address.short_formatted
    } else {
      return ''
    }
  }

  get merchant(): Merchant | string | undefined {
    if (!this.tx.merchant) return undefined
    else if (typeof this.tx.merchant === 'string') return this.tx.merchant
    else return new Merchant(this.tx.merchant)
  }

  get metadata(): Record<string, Json> {
    return this.tx.metadata
  }

  get notes() {
    const notes = this.tx.notes.replace('%2B', '+')

    return {
      short: notes.split('\n')[0],
      full: notes,
      toString: () => notes,
    }
  }

  get online(): boolean {
    return (
      !!this.tx.merchant &&
      typeof this.tx.merchant !== 'string' &&
      'online' in this.tx.merchant &&
      this.tx.merchant.online
    )
  }

  get pending(): boolean {
    // declined transactions are never pending
    if (this.declined) return false

    // cash is never pending
    if (this.is.cash) return false

    // all income and zero amounts seems to be exempt
    // NOTE: could change when current accounts release
    if (this.tx.amount >= 0) return false

    // if settled does not exists
    if (!('settled' in this.tx)) return true

    // or if settled field is empty
    if ('settled' in this.tx && !this.tx.settled.trim()) return true

    // assume transaction is not pending
    return false
  }

  get settled(): string {
    if (this.pending) return 'Pending'
    else {
      return `Settled: ${format(
        parseISO(this.tx.settled),
        'h:mma - do MMMM yyyy',
      )}`
    }
  }

  selfRequest(): MonzoRequest {
    return transactionRequest(this.id)
  }

  changeCategoryRequest(category: string): MonzoRequest {
    return {
      path: `/transactions/${this.id}`,
      body: {
        category: category,
      },
      method: 'PATCH',
    }
  }

  annotateRequest(key: string, val: string | number | boolean): MonzoRequest {
    const metaKey = `metadata[${key}]`

    return {
      path: `/transactions/${this.id}`,
      body: {
        [metaKey]: typeof val === 'string' ? val.replace('+', '%2B') : val,
      },
      method: 'PATCH',
    }
  }

  setNotesRequest(val: string): MonzoRequest {
    return this.annotateRequest('notes', val)
  }

  hideRequest(): MonzoRequest {
    return this.annotateRequest('monux_hidden', 'true')
  }

  unhideRequest(): MonzoRequest {
    return this.annotateRequest('notes', '')
  }

  attachmentUploadRequest(contentType = 'image/jpeg'): MonzoRequest {
    const random = Math.ceil(Math.random() * 9999)

    const extensions: any = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
    }
    const extension =
      contentType in extensions ? extensions[contentType] : 'image/jpeg'

    return {
      path: '/attachment/upload',
      body: {
        file_name: `monux-attachment-${random}.${extension}`,
        file_type: contentType,
      },
      method: 'POST',
    }
  }

  attachmentRegisterRequest(
    fileUrl: string,
    contentType = 'image/jpeg',
  ): MonzoRequest {
    return {
      path: '/attachment/register',
      body: {
        external_id: this.tx.id,
        file_url: fileUrl,
        file_type: contentType,
      },
      method: 'POST',
    }
  }

  get json(): MonzoTransactionResponse {
    return this.tx
  }

  get stringify(): string {
    return JSON.stringify(this.json)
  }
}

export function transactionRequest(id: string): MonzoRequest {
  return {
    path: `/transactions/${id}`,
    qs: {
      'expand[]': 'merchant',
    },
  }
}

// TODO: some of these fields are very optional
export interface MonzoTransactionResponse extends Record<string, Json> {
  account_balance: number
  account_id: string
  amount: number
  attachments: MonzoAttachmentResponse[]
  can_be_excluded_from_breakdown: boolean
  can_be_made_subscription: boolean
  can_split_the_bill: boolean
  category: string
  counterparty: MonzoCounterpartyResponse
  created: string
  currency: string
  decline_reason: string
  dedupe_id: string
  description: string
  fees: {}
  id: string
  include_in_spending: boolean
  international: null
  is_load: boolean
  labels: {}
  local_amount: number
  local_currency: string
  merchant: MonzoMerchantResponse | string | null
  metadata: Record<string, Json>
  notes: string
  originator: boolean
  scheme: string
  settled: string
  updated: string
  user_id: string
}

export interface MonzoTransactionOuterResponse extends Record<string, Json> {
  transaction: MonzoTransactionResponse
}

export interface MonzoTransactionsResponse extends Record<string, Json> {
  transactions: MonzoTransactionResponse[]
}

export interface MonzoCounterpartyResponse extends Record<string, Json> {
  name: string
  number: string
  preferred_name: string
  user_id: string
}

export interface TransactionRequestOpts {
  since?: Date | string
  before?: Date
  limit?: number
}
