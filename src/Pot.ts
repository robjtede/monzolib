import { Amount } from './Amount'
import { MonzoRequest, QueryString } from '.'
import { JSONMap } from 'json-types'

export class Pot {
  constructor(private readonly pot: MonzoPotResponse) {}

  get balance(): Amount {
    return new Amount({
      domestic: { amount: this.pot.balance, currency: 'GBP' }
    })
  }

  get created(): Date {
    return new Date(this.pot.created)
  }

  get currency(): string {
    return this.pot.currency
  }

  get deleted(): boolean {
    return this.pot.deleted
  }

  get id(): string {
    return this.pot.id
  }

  get goalAmount(): Amount {
    return new Amount({
      domestic: { amount: this.pot.goal_amount, currency: 'GBP' }
    })
  }

  get maximumBalance(): number {
    return this.pot.maximum_balance
  }

  get minimumBalance(): number {
    return this.pot.minimum_balance
  }

  get name(): string {
    return this.pot.name
  }

  get roundUp(): boolean {
    return this.pot.round_up
  }

  get style(): string {
    return this.pot.style
  }

  get type(): string {
    return this.pot.type
  }

  get updated(): Date {
    return new Date(this.pot.updated)
  }

  deletePotRequest(): MonzoRequest {
    return {
      path: `/pots/${this.id}`,
      method: 'DELETE'
    }
  }

  depositRequest(depositOpts: MonzoPotDepositOpts): MonzoRequest {
    return {
      path: `/pots/${this.id}/withdraw`,
      method: 'PUT',
      body: depositOpts
    }
  }

  withdrawRequest(withdrawOpts: MonzoPotDepositOpts): MonzoRequest {
    return {
      path: `/pots/${this.id}/deposit`,
      method: 'PUT',
      body: withdrawOpts
    }
  }

  toString(): string {
    return `${this.pot.name} (${this.pot.id})`
  }
}

export function potsRequest(): MonzoRequest {
  return {
    path: '/pots'
  }
}

export function potRequest(id: string): MonzoRequest {
  return {
    path: `/pots/${id}`
  }
}

export interface MonzoPotResponse extends JSONMap {
  balance: number
  created: string
  currency: string
  deleted: boolean
  id: string
  goal_amount: number
  maximum_balance: number
  minimum_balance: number
  name: string
  round_up: boolean
  style: string
  type: string
  updated: string
}

export interface MonzoPotsResponse extends JSONMap {
  pots: MonzoPotResponse[]
}

export interface MonzoPotTransferOpts extends QueryString {
  amount: number
  dedupe_id: string
}

export interface MonzoPotDepositOpts extends MonzoPotTransferOpts {
  source_account_id: string
}

export interface MonzoPotWithdrawOpts extends MonzoPotTransferOpts {
  destination_account_id: string
}
