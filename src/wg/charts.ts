import type { ChartConfiguration, ChartDataset } from 'chart.js'
import type { Match, Entry, Stats } from './match'

type ChartsBuilder = {
  entryFilter?: (entry: Entry, match: Match) => boolean
  title?: string,
  label: (entry: Entry, match: Match) => string
  sets: {
    init: (entry: Entry, playerId: number, match: Match) => ChartDataset<'line', number[]>
    datum: (
      stats: Stats[number],
      entry: Entry,
      playerId: number,
      entryIndex: number,
      match: Match
    ) => number
  }[]
  transformFilter?: (datum: number, i: number, data: number[], match: Match) => number | undefined
  stepSize?: number
  options?: ChartConfiguration<'line', number[]>['options']
}

type ChartsBuilderGroup = {
  label: ChartsBuilder['label']
  chartSets: ChartsBuilder['sets'][number][][]
}

export function makeCharts(
  match: Match,
  builders: ChartsBuilder[],
): ChartConfiguration<'line', number[]> [] {
  const entries = match.getEntries()

  let playerIds = Object.keys(entries[0].stats).map(parseInt)
  
  let charts = builders.map(({ title, sets, stepSize }) => {
    let labels: string[] = []

    let datasets = sets.map(({ init }) => {
      return playerIds.map(pid => init(entries[0], pid, match))
    }).flat()
    

    let chart: ChartConfiguration<'line', number[]> = {
      type: 'line',
      options: {
        plugins: {
          title: {
            text: title,
            font: {
              size: 20
            }
          }
        },
        scales: { yAxes: { ticks: { stepSize } } }
      },
      data: { labels, datasets },
    }

    return { chart, labels, datasets }
  })

  entries.forEach((entry, entryIndex) => {
    builders.forEach((builder, i) => {
      if (!builder.entryFilter(entry, match)) return
      let { labels, datasets } = charts[i]

      labels.push(builder.label(entry, match))

      builder.sets.forEach((dset, j) => {
        for (let playerId of playerIds) {
          let dataset = datasets[j * playerIds.length + playerId]
          let datum = dset.datum(entry.stats[playerId], entry, playerId, entryIndex, match)
          dataset.data.push(datum)
        }
      })
    })
  })

  builders.forEach((builder, i) => {
    if(!builder.transformFilter) return
    let chart = charts[i]

    chart.datasets.forEach(dset => {
      dset.data = dset.data.map((d, i) => builder.transformFilter(d, i, dset.data, match))
    })

    chart.labels = chart.labels.filter((_, i) => chart.datasets[0].data[i] !== undefined)
    chart.datasets.forEach(dset => {
      dset.data = dset.data.filter(d => d !== undefined)
    })
  })

  return charts.map(({ chart }) => chart)
}

function defaultDatasetInit(
  name: string,
  opts?: Partial<ChartDataset<'line', number[]>>
): ChartsBuilder['sets'][number]['init'] {
  return (entry: Entry, playerId: number, match: Match) => {
    let color = match.getPlayerColorHex(playerId)
    return {
      ...opts,
      label: `P${playerId + 1} ${name}`,
      borderColor: color,
      //pointBorderColor
      data: [],
    }
  }
}

const moveLabel = (entry: Entry) => {
  let {
    turn: { turnNumber, playerId, entries: tEntries },
  } = entry
  return `T${turnNumber}-P${playerId + 1}-M${tEntries.indexOf(entry) + 1}`
}

const playerTurnLabel = (entry: Entry) => {
  let { turn: { turnNumber, playerId } } = entry
  return `T${turnNumber}-P${playerId + 1}`
}

const turnLabel = (entry: Entry) => {
  let { turn: { turnNumber } } = entry
  return `Turn ${turnNumber}`
}

const moveCharts: ChartsBuilderGroup = {
  label: moveLabel,
  chartSets: [
    [
      {
        init: defaultDatasetInit('Income'),
        datum: (stats) => stats.income,
      },
    ],
    [
      {
        init: defaultDatasetInit('Army Value'),
        datum: (stats) => stats.armyValue,
      },
      {
        init: defaultDatasetInit('Army Value + Gold', { borderDash: [5] }),
        datum: ({ armyValue, gold }) => armyValue + gold,
      },
    ],
  ],
}
const x = 
[
  [
    moveLabel, [
      [
        ['Income', stats => stats.income]
      ],
      [
        ['Army Value', stats => stats.armyValue],
        ['Army Value + Gold', ({ armyValue, gold }) => armyValue + gold, { borderDash: [5] }]
      ],
      [
        ['Combat Unit Count', stats => stats.combatUnitCount]
      ],
      [
        ['Groove', stats => stats.groove],
        ['Max Groove', stats => stats.maxGroove, { borderDash: [5], pointRadius: 0 }]
      ]
    ]
  ]
]