const css = require('./live-stats.css').default
import { Chart, ChartConfiguration, registerables } from 'chart.js'
import { Match, MatchData, Status } from './wg/match'

Chart.register(...registerables)

declare global {
  interface Window {
    match: Match
    setMatch: typeof setMatch
  }
}
window.setMatch = setMatch
addCss(css.toString())
reloadMatchScript()

const sp = new URL(location.href).searchParams

const show = (sp.get('show') || '').split(',')
const hide_on_match_end = Boolean(sp.get('hide_on_match_end'))

if(!show.length){
  show.push('current_stats')
}

function addCss(css: string){
  let style =  document.createElement('style')
  style.innerText = css
  document.head.append(style)
}

function reloadMatchScript() {
  let s = document.createElement('script')
  s.src = './wgml-live-match.js'
  ;(document.head || document.documentElement).append(s)
  s.replaceWith()
}

function setMatch(matchData: MatchData) {
  try {
    if(matchData){
      window.match = new Match(matchData)
      let data = readMatchData(window.match)
      showMatchData(data)
    }
  } catch (e) {
    console.error(e)
  }

  setTimeout(() => { reloadMatchScript() }, matchData ? 2000 : 0)
}

function readMatchData(match: Match) {
  let data = {
    current_stats: null as (Status[number] & {player: string})[],
    charts: {} as { [type: string]: ChartConfiguration<'line', number[]>},
  }

  let isFinished = match.getWinners().length > 0
  if (isFinished && hide_on_match_end) return data

  let charts: {
    [chart_type: string]: ChartConfiguration<'line', number[]>[]
  } = {}

  const getCharts = (chart_type: string) => {
    if(chart_type == 'move'){
      return match.getCharts()
    }

    if(chart_type == 'turn'){
      return match.getTurnEndCharts()
    }

    return match.getAverageCharts()
  }

  show.forEach((type) => {
    if (type == 'current_stats') {
      const players = match.getPlayers()
      const entry = match.getCurrentEntry()
      data.current_stats = players.map((player, i) => Object.assign({ player: `P${player.id+1} - ${player.commander}` },entry.status[player.id]))
    }

    if(type.startsWith('chart_')){
      let [ name, chart_type = 'avg' ] = type.split(':')
      let [income, army, unit_count, combat_uc] = charts[chart_type] = charts[chart_type] || getCharts(chart_type)

      if(name == 'chart_income'){
        data.charts[type] = income
      }

      if(name == 'chart_army'){
        data.charts[type] = army
      }

      if(name == 'chart_unit_count'){
        data.charts[type] = unit_count
      }

      if(name == 'chart_combat_uc'){
        data.charts[type] = combat_uc
      }
    }
  })

  return data
}


const elements: { [id: string]: HTMLElement } = {}

function showMatchData(data: ReturnType<typeof readMatchData>){
  removeUnusedElements(data)

  if(data.current_stats){
    let table = makeStatsTable(data.current_stats)
    table.id = 'current_stats'

    if(!elements.current_stats){
      elements.current_stats = table
      document.body.append(table)
    }
    else {
      elements.current_stats.replaceWith(table)
    }
    elements.current_stats = table
  }

  for(let type in data.charts){
    if(!elements[type]){
      let ele = elements[type] = document.createElement('canvas')
      ele.id = type
      ele.classList.add('wg_box')

      document.body.append(ele)
    }

    let canvas = elements[type] as HTMLCanvasElement
    setChart(canvas, data.charts[type])
  }
}

function makeStatsTable(stats: {
    player: string
    gold: number;
    income: number;
    armyValue: number;
    unitCount: number;
    combatUnitCount: number;
}[]): HTMLTableElement{
  let table = document.createElement('table')
  table.innerHTML = '<thead><tr><th style="opacity:0"></th><th>Gold</th><th>Income</th><th>Army</th><th>Units</th><th>Combat U.</th></tr></thead>'
  let tbody = document.createElement('tbody')
  for(let stat of stats){
    tbody.innerHTML += `<tr><td>${stat.player}</td><td>${stat.gold}</td><td>${stat.income}</td><td>${stat.armyValue}</td><td>${stat.unitCount}</td><td>${stat.combatUnitCount}</td></tr>`
  }
  table.append(tbody)
  return table
}


let charts: { [id: string]: Chart } = {}

function setChart(
  canvas: HTMLCanvasElement,
  data: ChartConfiguration<'line', number[], unknown>,
  chart: Chart | undefined = charts[canvas.id]
) {
  if (!chart) {
    chart = new Chart(canvas.getContext('2d'), data)
    charts[canvas.id] = chart
  } else {
    chart.data.labels.length = 0
    chart.data.labels.push(...(data.data.labels || []))
    chart.data.datasets.length = 0
    chart.data.datasets.push(...(data.data.datasets || []))
    chart.options = data.options
    chart.update('none')
  }
}

function removeUnusedElements(data: ReturnType<typeof readMatchData>) {
  for (let type in elements) {
    if (!data[type] && !data.charts[type]) {
      elements[type].replaceWith()
      delete elements[type]

      if(charts[type]){
        charts[type].destroy()
        delete charts[type]
      }
    }
  }
}