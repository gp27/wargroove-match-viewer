const initialUrl = new URL(location.href)

export const initialUrlParams = {
    match_id: initialUrl.searchParams.get('match_id')
}

const cleanUrl = new URL(initialUrl.href)
cleanUrl.search = ''

history?.replaceState(null, null, cleanUrl.href)