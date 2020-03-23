import {
  format,
  startOfDay,
  isSameDay,
  isSameYear,
  subDays,
  parseISO,
} from 'date-fns'
import { groupBy, map, sumBy } from 'lodash'

import { Transaction } from './Transaction'
import { Amount, SimpleAmount, MonzoBalanceResponse } from './Amount'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export const enum GroupingStrategy {
  Day = 'day',
  Category = 'category',
  Merchant = 'merchant',
  None = 'none',
}

export const groupTransactions = (
  txs: Transaction[],
  method = GroupingStrategy.None,
): TransactionGroup[] => {
  const groupKey: GroupKeyFunctions = {
    [GroupingStrategy.Day]: (tx) => {
      return startOfDay(tx.created).toISOString()
    },

    [GroupingStrategy.Category]: (tx) => {
      return tx.category.formatted
    },

    [GroupingStrategy.Merchant]: (tx) => {
      if (typeof tx.merchant === 'string') {
        return tx.merchant
      } else {
        return tx.merchant
          ? tx.merchant.groupId
          : tx.counterparty.user_id
          ? 'monzo-contacts'
          : 'top-ups'
      }
    },

    [GroupingStrategy.None]: () => {
      return 'unsorted'
    },
  }

  return map(groupBy(txs, groupKey[method]), (txs, id) => ({
    id,
    method,
    txs,
  }))
}

// TODO: sortTransactions

export const getGroupTitle = (group: TransactionGroup): string => {
  const titleFns: GroupTitleFunctions = {
    [GroupingStrategy.Day]: (group) => {
      const created = parseISO(group.id)
      const now = Date.now()

      if (isSameDay(now, created)) {
        return 'Today'
      } else if (isSameDay(created, subDays(now, 1))) {
        return 'Yesterday'
      } else if (isSameYear(created, now)) {
        return format(created, 'EEEE, do MMMM')
      } else {
        return format(created, 'EEEE, do MMMM yyyy')
      }
    },

    [GroupingStrategy.Category]: (group) => {
      return group.txs[0].category.formatted
    },

    [GroupingStrategy.Merchant]: (group) => {
      const tx = group.txs[0]

      if (typeof tx.merchant === 'string') {
        return tx.merchant
      } else {
        return tx.merchant
          ? tx.merchant.name
          : tx.counterparty.user_id
          ? 'Monzo Contacts'
          : 'Top Ups'
      }
    },

    [GroupingStrategy.None]: () => {
      return 'Unsorted'
    },
  }

  return titleFns[group.method](group)
}

export const sumGroup = (txs: Transaction[]): Amount => {
  const filtered = txs
    .filter((tx) => !tx.is.metaAction || !tx.declined)
    .filter((tx) => tx.amount.negative)

  const sum = sumBy(filtered, (tx) => tx.amount.raw)

  return new Amount({
    domestic: {
      amount: sum,
      currency: txs[0].amount.currency,
    },
  })
}

export function extractBalanceAndSpent(
  bal: MonzoBalanceResponse,
): { balance: Amount; spent: Amount } {
  const domesticBalance: SimpleAmount = {
    amount: bal.balance,
    currency: bal.currency,
  }

  const domesticSpend: SimpleAmount = {
    amount: bal.spend_today,
    currency: bal.currency,
  }

  if (bal.local_currency) {
    const localBalance: SimpleAmount = {
      amount: bal.balance * bal.local_exchange_rate,
      currency: bal.local_currency,
    }

    const localSpend: SimpleAmount = {
      amount:
        bal.local_spend.length > 0
          ? bal.local_spend[0].spend_today * bal.local_exchange_rate
          : 0,
      currency: bal.local_currency,
    }

    return {
      balance: new Amount({
        domestic: domesticBalance,
        local: localBalance,
      }),
      spent: new Amount({ domestic: domesticSpend, local: localSpend }),
    }
  } else {
    return {
      balance: new Amount({ domestic: domesticBalance }),
      spent: new Amount({ domestic: domesticSpend }),
    }
  }
}

interface GroupKeyFunctions {
  [method: string]: (tx: Transaction) => string
}

export interface TransactionGroup {
  id: string
  method: GroupingStrategy
  txs: Transaction[]
}

interface GroupTitleFunctions {
  [method: string]: (group: TransactionGroup) => string
}
