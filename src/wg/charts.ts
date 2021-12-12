import type { ChartConfiguration, ChartDataset } from 'chart.js'
import { initialUrlParams } from '../utils'
import type { Match, Entry, Stats } from './match'

type Dataset = ChartDataset<'line', number[]>

type DatumGetter = (
  stats: Stats[number],
  entry: Entry,
  playerId: number,
  entryIndex: number,
  match: Match
) => number

type DataSetInit = (entry: Entry, playerId: number, match: Match) => Dataset

type EntryLabeler = (entry: Entry, match: Match) => string

type EntryFilter = (entry: Entry, match: Match) => boolean

type DatumTransformFilter = (
  datum: number,
  i: number,
  data: number[],
  playerId: number,
  playerData: number[][],
  match: Match
) => number | undefined

type DatumMerger = (datum: number[], i: number, match: Match) => number[]

type ChartsBuilder = {
  entryFilter?: EntryFilter
  title?: string
  label: EntryLabeler
  sets: {
    init: DataSetInit
    datum: DatumGetter
  }[]
  transformFilter?: DatumTransformFilter
  //merger?: DatumMerger
  stepSize?: number
  options?: ChartConfiguration<'line', number[]>['options']
}

export function makeCharts(
  match: Match,
  builders: ChartsBuilder[]
): ChartConfiguration<'line', number[]>[] {
  const entries = match.getEntries()

  let playerIds = match.getPlayers().map((p) => p.id)

  let charts = builders.map(({ title, sets, stepSize }) => {
    let labels: string[] = []

    let datasets: Dataset[] = []
    let playerDatasets: Dataset[][] = Array(playerIds.length)
      .fill(0)
      .map((_) => [])

    sets.forEach(({ init }) => {
      for (let pid of playerIds) {
        let dset = init(entries[0], pid, match)
        datasets.push(dset)
        playerDatasets[pid].push(dset)
      }
    })

    let chart: ChartConfiguration<'line', number[]> = {
      type: 'line',
      options: {
        plugins: {
          title: {
            display: true,
            text: title,
            font: {
              size: 20,
            },
          },
        },
        scales: { yAxes: { ticks: { stepSize } } },
      },
      data: { labels, datasets },
    }

    return { chart, labels, datasets, playerDatasets }
  })

  entries.forEach((entry, entryIndex) => {
    builders.forEach((builder, i) => {
      if (builder.entryFilter && !builder.entryFilter?.(entry, match)) return
      let { labels, datasets, playerDatasets } = charts[i]

      labels.push(builder.label(entry, match))

      builder.sets.forEach((dset, i) => {
        for (let playerId of playerIds) {
          let dataset = playerDatasets[playerId][i]
          let datum = dset.datum(
            entry.stats[playerId],
            entry,
            playerId,
            entryIndex,
            match
          )
          dataset.data.push(datum)
        }
      })
    })
  })

  builders.forEach((builder, i) => {
    if (!builder.transformFilter) return
    let chart = charts[i]

    let pairs: [Dataset, Dataset['data']][] = []

    builder.sets.forEach((_, i) => {
      for (let playerId of playerIds) {
        let dataset = chart.playerDatasets[playerId][i]

        let d = dataset.data.map((d, k) => {
          let pdata = playerIds.map((pid) => chart.playerDatasets[pid][i].data)
          return builder.transformFilter(
            d,
            k,
            dataset.data,
            playerId,
            pdata,
            match
          )
        })

        pairs.push([dataset, d])
      }
    })

    for (let [dataset, data] of pairs) {
      dataset.data = data
    }

    chart.chart.data.labels = chart.labels.filter(
      (_, i) => chart.datasets[0].data[i] !== undefined
    )
    chart.datasets.forEach((dset) => {
      dset.data = dset.data.filter((d) => d !== undefined)
    })

    /*if(builder.merger){
      let new_sets = builder.sets.reduce((dsets, dset, i) => {
        let original_sets = playerIds.map((playerId) => chart.playerDatasets[playerId][i])
        
        let merged_data: number[][] = []

        for(let i = 0; i < original_sets[0].data.length; i++){
          let data = original_sets.map((s) => s.data[i])
          merged_data.push(
            builder.merger(data, i, match)
          )
        }





        return dsets.concat(merged_sets)
      }, [] as Dataset)

    }*/
  })

  return charts.map(({ chart }) => chart)
}

function defaultDatasetInit(
  name: string,
  opts?: Partial<Dataset>
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
  let {
    turn: { turnNumber, playerId },
  } = entry
  return `T${turnNumber}-P${playerId + 1}`
}

const turnLabel = (entry: Entry) => {
  let {
    turn: { turnNumber },
  } = entry
  return `Turn ${turnNumber}`
}

const turnEndFilter = (entry) => entry.turn.entries.slice(-1)[0] == entry

const turnStartFilter = (entry) => entry.turn.entries[0] == entry

const namedChartDatasets: Record<
  string,
  {
    title: string
    stepSize?: number
    sets: {
      name?: string
      datum: DatumGetter
      opts?: Partial<Dataset>
    }[]
  }
> = {
  income: {
    title: 'Income',
    stepSize: 100,
    sets: [
      {
        datum: (stats) => stats.income,
      },
    ],
  },

  army: {
    title: 'Army Value',
    sets: [
      {
        datum: (stats) => stats.armyValue,
      },
      {
        name: 'Army Value + Gold',
        datum: ({ armyValue, gold }) => armyValue + gold,
        opts: { borderDash: [5] },
      },
    ],
  },

  unit_count: {
    title: 'Combat Unit Count',
    sets: [
      {
        datum: (stats) => stats.combatUnitCount,
      },
    ],
  },

  groove: {
    title: 'Groove',
    stepSize: 10,
    sets: [
      {
        datum: (stats) => stats.groove,
      },
      {
        name: 'Max Groove',
        datum: (stats) => stats.maxGroove,
        opts: { borderDash: [5], pointRadius: 0 },
      },
    ],
  },

  commander_health: {
    title: 'Commander Health',
    sets: [
      {
        datum: (stats) => stats.commanderHealth,
      },
    ],
  }
}

const namedChartTransforms: Record<
  string,
  {
    label: EntryLabeler
    title_suffix?: string
    entryFilter?: EntryFilter
    transformFilter?: DatumTransformFilter
  }
> = {
  turn_end: {
    label: playerTurnLabel,
    entryFilter: turnEndFilter,
  },

  turn_start: {
    label: playerTurnLabel,
    entryFilter: turnStartFilter,
  },

  avg: {
    title_suffix: 'Avg',
    label: turnLabel,
    entryFilter: turnEndFilter,
    transformFilter: (v, i, data, playerId, playerData, match) => {
      let n = playerData.length
      if (i % n != 0 || i + n > data.length) return
      return data.slice(i, i + n).reduce((a, b) => a + b, 0) / n
    },
  },

  move: {
    label: moveLabel,
  },
}

function generateChartBuilder(
  dataSetsName: keyof typeof namedChartTransforms,
  transformName: string
): ChartsBuilder {
  let dset = namedChartDatasets[dataSetsName]
  let transf = namedChartTransforms[transformName]

  if (!dset || !transf){
    console.error('Invalid chart generator names')
    return
  }

  let { title, stepSize = 1, sets } = dset

  let { label, title_suffix = '', entryFilter, transformFilter } = transf

  if (title_suffix) {
    title += ' ' + title_suffix
  }

  return {
    title,
    entryFilter,
    transformFilter,
    label,
    stepSize,
    sets: sets.map(({ datum, name, opts }) => {
      return {
        datum,
        init: defaultDatasetInit(name || title, opts),
      }
    }),
  }
}

export function getChartsByName(match: Match, names: [string, string][]) {
  let builders = names.map((n) => generateChartBuilder(...n)).filter(Boolean)
  return makeCharts(match, builders)
}

export const getChartDatasetNames = () => Object.keys(namedChartDatasets)
export const getChartTransformNames = () => Object.keys(namedChartTransforms)

;(window as any)._charts = {
  namedChartDatasets,
  namedChartTransforms,

  aiSetup: () => {
    Object.assign(namedChartDatasets, {
      potential: {
        title: 'Potential',
        sets: [{ datum: (stats) => stats.potential }],
      },
    })

    Object.assign(namedChartTransforms, {
      delta: {
        title_suffix: 'Delta',
        label: playerTurnLabel,
        entryFilter: turnEndFilter,
        transformFilter: (v, i, data) => {
          return v - (data[i - 1] || v)
        },
      },

      zerosum: {
        title_suffix: 'Zero Sum',
        label: playerTurnLabel,
        entryFilter: turnEndFilter,
        transformFilter: (v, i, data, playerId, playerData, match) => {
          let enemysum = 0

          let deltas = playerData.map((data, pid) => {
            let v = data[i]
            let delta = v - (data[i - 1] || v)

            if (pid != playerId) {
              enemysum += delta
            }
            return delta
          })

          return deltas[playerId] - enemysum / (deltas.length - 1)
        },
      },
    })
  }
}

if(initialUrlParams.ai){
  (window as any)._charts.aiSetup()
}