import { JSONMap } from 'json-types'
import { QueryString, MonzoRequest } from './api'

export class Account {
  constructor(private readonly acc: MonzoAccountResponse) {}

  get created(): Date {
    return new Date(this.acc.created)
  }

  get description(): string {
    return this.acc.description
  }

  get id(): string {
    return this.acc.id
  }

  get name(): string {
    return this.description
  }

  balanceRequest(): MonzoRequest {
    return {
      path: '/balance',
      qs: {
        account_id: this.id
      }
    }
  }

  transactionRequest(txId: string): MonzoRequest {
    return {
      path: `/transactions/${txId}`,
      qs: {
        'expand[]': 'merchant'
      }
    }
  }

  transactionsRequest(options: PaginationOpts = {}): MonzoRequest {
    const opts: MonzoTransactionQuery = {
      account_id: this.id,
      'expand[]': 'merchant'
    }

    return {
      path: '/transactions',
      qs: opts
    }
  }

  targetsRequest(): MonzoRequest {
    return {
      path: '/targets',
      qs: {
        account_id: this.id
      }
    }
  }

  limitsRequest(): MonzoRequest {
    return {
      path: '/balance/limits',
      qs: {
        account_id: this.id
      }
    }
  }

  cardsRequest(): MonzoRequest {
    return {
      path: '/card/list',
      qs: {
        account_id: this.id
      }
    }
  }

  freezeCardRequest(cardId: string): MonzoRequest {
    return {
      path: '/card/toggle',
      method: 'PUT',
      body: {
        card_id: cardId,
        status: 'INACTIVE'
      }
    }
  }

  defrostCardRequest(cardId: string): MonzoRequest {
    return {
      path: '/card/toggle',
      method: 'PUT',
      body: {
        card_id: cardId,
        status: 'ACTIVE'
      }
    }
  }

  get json(): MonzoAccountResponse {
    return this.acc
  }

  get stringify(): string {
    return JSON.stringify(this.json)
  }
}

export const accountsRequest = (): MonzoRequest => {
  return { path: '/accounts' }
}

export const paginate = (options: PaginationOpts = {}): QueryString => {
  const opts: QueryString = {}

  if (options.since) {
    if (options.since instanceof Date) {
      opts.since = options.since.toISOString()
    } else {
      opts.since = options.since
    }
  }

  if (options.before) {
    opts.before = options.before.toISOString()
  }

  if (options.limit) {
    opts.limit = options.limit
  }

  return opts
}

export interface PaginationOpts {
  since?: Date | string
  before?: Date
  limit?: number
}

export interface MonzoAccountsResponse extends JSONMap {
  accounts: MonzoAccountResponse[]
}

export interface MonzoAccountResponse extends JSONMap {
  id: string
  description: string
  created: string
  type: string
}

interface MonzoTransactionQuery extends QueryString {
  account_id: string
  'expand[]'?: string
  since?: string
  before?: string
  limit?: number
}
