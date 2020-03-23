import test from 'ava'

import { Amount } from '../'

function almostEqual(candidate: number, target: number) {
  return (
    candidate - Number.EPSILON <= target && candidate + Number.EPSILON >= target
  )
}

const nativeAmount = new Amount({
  domestic: {
    amount: 123,
    currency: 'GBP',
  },
})

const localAmount = new Amount({
  domestic: {
    amount: 123,
    currency: 'GBP',
  },
  local: {
    amount: 234,
    currency: 'USD',
  },
})

const usdAmount = new Amount({
  domestic: {
    amount: 123,
    currency: 'USD',
  },
})

const eurAmount = new Amount({
  domestic: {
    amount: 123,
    currency: 'EUR',
  },
})

const preciseAmount = new Amount({
  domestic: {
    amount: 123.75,
    currency: 'GBP',
  },
})

const overpreciseAmount = new Amount({
  domestic: {
    amount: 123.567,
    currency: 'GBP',
  },
})

// const negativeAmount = new Amount({
//   domestic: {
//     amount: -123,
//     currency: 'GBP',
//   },
// })

test('Amount cannot be constructed incorrectly', async (t) => {
  t.throws(
    () => {
      new Amount(undefined as any)
    },
    TypeError,
    'Amount constructor should only accept AmountOpts object as first argument',
  )

  t.throws(
    () => {
      new Amount(null as any)
    },
    TypeError,
    'Amount constructor should only accept AmountOpts object as first argument',
  )

  t.throws(
    () => {
      new Amount(123 as any)
    },
    TypeError,
    'Amount constructor should only accept AmountOpts object as first argument',
  )

  t.throws(
    () => {
      new Amount('£12.30' as any)
    },
    TypeError,
    'Amount constructor should only accept AmountOpts object as first argument',
  )

  t.throws(
    () => {
      new Amount({
        domestic: {},
      } as any)
    },
    TypeError,
    "Amount constructor's domestic property should only accept valid `SimpleAmount`s",
  )

  t.throws(
    () => {
      new Amount({
        domestic: {
          amount: 123,
        },
      } as any)
    },
    TypeError,
    "Amount constructor's domestic property should only accept valid `SimpleAmount`s",
  )

  t.throws(
    () => {
      new Amount({
        domestic: {
          currency: 'GBP',
        },
      } as any)
    },
    TypeError,
    "Amount constructor's domestic property should only accept valid `SimpleAmount`s",
  )

  t.throws(
    () => {
      new Amount({
        domestic: {
          amount: '123',
          currency: 'GBP',
        },
      } as any)
    },
    TypeError,
    "Amount constructor's domestic property should only accept valid `SimpleAmount`s",
  )

  t.throws(
    () => {
      new Amount({
        domestic: {
          amount: 123,
          currency: 1,
        },
      } as any)
    },
    TypeError,
    "Amount constructor's domestic property should only accept valid `SimpleAmount`s",
  )

  t.throws(
    () => {
      new Amount({
        domestic: {
          amount: 123,
          currency: 'GBP',
        },
        local: {},
      } as any)
    },
    TypeError,
    "Amount constructor's local property should only accept valid `SimpleAmount`s",
  )

  t.throws(
    () => {
      new Amount({
        domestic: {
          amount: 123,
          currency: 'GBP',
        },
        local: {
          amount: 123,
        },
      } as any)
    },
    TypeError,
    "Amount constructor's local property should only accept valid `SimpleAmount`s",
  )

  t.throws(
    () => {
      new Amount({
        domestic: {
          amount: 123,
          currency: 'GBP',
        },
        local: {
          currency: 'GBP',
        },
      } as any)
    },
    TypeError,
    "Amount constructor's local property should only accept valid `SimpleAmount`s",
  )

  t.throws(
    () => {
      new Amount({
        domestic: {
          amount: 123,
          currency: 'GBP',
        },
        local: {
          amount: '123',
          currency: 'GBP',
        },
      } as any)
    },
    TypeError,
    "Amount constructor's local property should only accept valid `SimpleAmount`s",
  )

  t.throws(
    () => {
      new Amount({
        domestic: {
          amount: 123,
          currency: 'GBP',
        },
        local: {
          amount: 123,
          currency: 1,
        },
      } as any)
    },
    TypeError,
    "Amount constructor's local property should only accept valid `SimpleAmount`s",
  )
})

test('Amount#foreign return foreign-ness', async (t) => {
  t.false(nativeAmount.foreign, 'domestic amount should not be foreign')
  t.true(localAmount.foreign, 'local amount should be foreign')
})

test('Amount#amount returns untruncated amount in major units', async (t) => {
  t.is(nativeAmount.amount, 1.23)
  t.is(preciseAmount.amount, 1.2375)
  t.true(almostEqual(overpreciseAmount.amount, 1.23567))
})

test('Amount#scale returns the major/minor divisor', async (t) => {
  t.is(nativeAmount.scale, 100)
  t.is(usdAmount.scale, 100)
  t.is(eurAmount.scale, 100)
})

test('Amount#raw returns the amount in minor units', async (t) => {
  t.is(nativeAmount.raw, 123)
  t.is(preciseAmount.raw, 123.75)
  t.is(overpreciseAmount.raw, 123.567)
})

test('Amount#json returns a valid constructor object for the currency Amount', async (t) => {
  t.deepEqual(nativeAmount.json, {
    domestic: {
      amount: 123,
      currency: 'GBP',
    },
    local: undefined,
  })

  t.deepEqual(localAmount.json, {
    domestic: {
      amount: 123,
      currency: 'GBP',
    },
    local: {
      amount: 234,
      currency: 'USD',
    },
  })

  t.deepEqual(preciseAmount.json, {
    domestic: {
      amount: 123.75,
      currency: 'GBP',
    },
    local: undefined,
  })
})

test('Amount#stringify returns a string representation of the constructor object', async (t) => {
  t.is(nativeAmount.stringify, '{"domestic":{"amount":123,"currency":"GBP"}}')
  t.is(
    localAmount.stringify,
    '{"domestic":{"amount":123,"currency":"GBP"},"local":{"amount":234,"currency":"USD"}}',
  )
  t.is(
    preciseAmount.stringify,
    '{"domestic":{"amount":123.75,"currency":"GBP"}}',
  )
})

test.todo('Amount#toString returns the default formatting')
test.todo('Amount#valueOf returns the raw amount')

test.todo('Amount#exchanged returns single amount in local currency')
test.todo('Amount#positive returns positive-ness')
test.todo('Amount#negative returns negative-ness')
test.todo('Amount#sign returns respective +/- indicator')
test.todo('Amount#signIfPositive returns sign only if amount is positive')
test.todo('Amount#signIfNegative returns sign only if amount is negative')
test.todo('Amount#symbol returns respective symbol for each supported currency')
test.todo(
  'Amount#separator returns respective seperator for each supported currency',
)

test.todo('Amount#format returns the default formatting')
