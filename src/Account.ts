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
    return this.owners[0].preferred_name
  }

  get owners(): AccountOwner[] {
    return this.acc.owners
  }

  get userId(): string {
    return this.owners[0].user_id
  }

  get ownerNames(): string[] {
    return this.owners.map(x => x.preferred_name)
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

  transactionsRequest(
    options: { since?: Date | string; before?: Date; limit?: number } = {}
  ): MonzoRequest {
    const opts: MonzoTransactionQuery = {
      account_id: this.id,
      'expand[]': 'merchant'
    }

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

    return {
      path: '/transactions',
      qs: opts
    }
  }

  targetsRequest(): MonzoRequest {
    const opts: QueryString = {
      account_id: this.id
    }

    return {
      path: '/targets',
      qs: opts
    }
  }

  limitsRequest(): MonzoRequest {
    const opts = {
      account_id: this.id
    }

    return {
      path: '/balance/limits',
      qs: opts
    }
  }

  overdraftStatusRequest(): MonzoRequest {
    const opts = {
      account_id: this.id
    }

    return {
      path: '/overdraft/status',
      qs: opts
    }
  }

  get json(): MonzoAccountResponse {
    return this.acc
  }

  get stringify(): string {
    return JSON.stringify(this.json)
  }
}

export function accountsRequest(): MonzoRequest {
  return {
    path: '/accounts',
    qs: {
      account_type: 'uk_retail'
    }
  }
}

export interface MonzoAccountsResponse extends JSONMap {
  accounts: MonzoAccountResponse[]
}

export interface AccountOwner extends JSONMap {
  user_id: string
  preferred_name: string
  preferred_first_name: string
}

export interface MonzoAccountResponse extends JSONMap {
  account_number: string
  closed: boolean
  created: string
  description: string
  id: string
  owners: AccountOwner[]
  sort_code: string
  type: string
}

export interface MonzoTransactionQuery extends QueryString {
  account_id: string
  'expand[]'?: string
  since?: string
  before?: string
  limit?: number
}
