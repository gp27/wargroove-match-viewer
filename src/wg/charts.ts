import type { ChartConfiguration, ChartDataset } from 'chart.js'
import type { Match, Entry, Status } from './match'

type ChartsBuilder = {
  entryFilter?: (entry: Entry) => boolean
  label: (entry: Entry) => string
  sets: {
    init: (entry: Entry, playerId: number, match: Match) => ChartDataset<'line', number[]>
    datum: (
      status: Status[number],
      entry: Entry,
      playerId: number,
    ) => number
  }[]
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

  let playerIds = Object.keys(entries[0].status).map(parseInt)
  
  let charts = builders.map(({ sets, stepSize }) => {
    let labels: string[] = []

    let datasets = sets.map(({ init }) => {
      return playerIds.map(pid => init(entries[0], pid, match))
    }).flat()
    

    let chart: ChartConfiguration<'line', number[]> = {
      type: 'line',
      options: { scales: { yAxes: { ticks: { stepSize } } } },
      data: { labels, datasets },
    }

    return { chart, labels, datasets }
  })

  for(let entry of entries){
    builders.forEach((builder, i) => {
      if(!builder.entryFilter(entry)) return
      let { labels, datasets } = charts[i]

      labels.push(builder.label(entry))

      builder.sets.forEach((dset, j) => {
        for(let playerId of playerIds){
          let dataset = datasets[j * playerIds.length + playerId]
          let datum = dset.datum(entry.status[playerId], entry, playerId)
          dataset.data.push(datum)
        }
      })
    })
  }
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
        datum: (status) => status.income,
      },
    ],
    [
      {
        init: defaultDatasetInit('Army Value'),
        datum: (status) => status.armyValue,
      },
      {
        init: defaultDatasetInit('Army Value + Gold', { borderDash: [5] }),
        datum: ({ armyValue, gold }) => armyValue + gold,
      },
    ],
  ],
}