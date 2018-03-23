/* Controls loading visibility */
function showLoading(prefix, visible) {
    const $loading = document.getElementById('loading')
    $loading.style.display = (visible ? 'block' : 'none')
    $loading.textContent = `${prefix}: Loading...`
}

/* Creates new array of beer list fetches */
function createBeerListFetches(){
    return [fetch('https://api.punkapi.com/v2/beers'), fetch('https://api.punkapi.com/v2/beers')] 
}

/* Requests beer list by using promises */
function promisesRequest() {
    const beerListFetches = createBeerListFetches()

    console.clear()
    console.log("promisesRequest()")
    showLoading("Promises", true)
    
    Promise
        .all(beerListFetches)
        .then((results) => {
            const normalizationPromises = results.map((result) => { 
                console.log(`Promises$then -> Normalize`)
                return new Promise((resolve) => {
                    setTimeout(() => { 
                        result.json().then((data) => {
                            const names = 
                                data.map(beer => beer.name)
                                    .reduce((acc, name) => `${acc}, ${name}`)
                                    
                            resolve(names)
                        })
                    }, 2000)
                })
            })
            return Promise.all(normalizationPromises)
        })
        .then(names => names.forEach((nameList) => console.log(`Promises$then Names=[${nameList}]`)))
        .catch((reason) => {
            console.log(`Promises$Catch: ${reason}`)
        })
        .finally(() => {
            console.log(`Promises$Finally`)
            showLoading("Promises", false)
        })
}

/* Requests beer list by async/await */
async function asyncAwaitRequest() {
    const beerListFetches = createBeerListFetches()

    console.clear()
    console.log("asyncAwaitRequest()")
    showLoading("Async/Await", true)
    
    const results = await Promise.all(beerListFetches)
    const names = await Promise.all(
        results.map((result) => { 
            console.log(`AsyncAwait -> Normalize`)
            return new Promise((resolve) => {
                setTimeout(() => { 
                    result.json().then((data) => {
                        const names = data.map(beer => beer.name)
                                          .reduce((acc, name) => `${acc}, ${name}`)
                        resolve(names)
                    })
                }, 2000)
            })
        })
    )

    names.forEach((nameList) => console.log(`AsyncAwait Names=[${nameList}]`))

    console.log(`AsyncAwait$Done`)
    showLoading("Async/Await", false)
}

/* Requests beer list by rxJS */
// function rxJsRequest() {
//     const beerListFetches = createBeerListFetches()
    
//     console.clear()
//     console.log("rxJsRequest()")

//     showLoading("RxJS", true)

//     Rx.Observable
//         .fromPromise(Promise.all(beerListFetches))
//         .concatMap((result) => result)
//         .flatMap((result) => { 
//             console.log(`RxJs -> Normalize`)
//             return Rx.Observable.create((observer) => {
//                 setTimeout(() => { 
//                     result.json().then((data) => {
//                         const names = data.map(beer => beer.name).reduce((acc, name) => `${acc}, ${name}`)
//                         observer.onNext(names)
//                         observer.onCompleted()
//                     })
//                 }, 2000)
//             })
//         })
//         .subscribe(
//             (names) => console.log(`RxJs$onNext Names=[${names}]`), // onNext
//             (error) => console.log(`RxJs$onError: ${error}`), // onError
//             () => {  // onComplete
//                 console.log(`RxJs$onComplete`)
//                 showLoading("RxJS", false)
//             }
//         )
// }

/* Requests beer list by rxJS with timer */
function rxJsRequest() {
    const beerListFetches = createBeerListFetches()
    
    console.clear()
    console.log("rxJsRequest()")

    const bomb = new Rx.Subject()

    Rx.Observable
        .interval(250)
        .takeUntil(bomb)
        .subscribe(
            (time) => showLoading("RxJS", time % 2 == 0), // onNext
            (error) => console.log(`RxJs$onError: ${error}`), // onError
            () => showLoading("RxJS", false) // onCompleted
        )

    Rx.Observable
        .fromPromise(Promise.all(beerListFetches))
        .concatMap((result) => result)
        .flatMap((result) => { 
            console.log(`RxJs -> Normalize`)
            return Rx.Observable.create((observer) => {
                setTimeout(() => { 
                    result.json().then((data) => {
                        const names = data.map(beer => beer.name).reduce((acc, name) => `${acc}, ${name}`)
                        observer.onNext(names)
                        observer.onCompleted()
                    })
                }, 2000)
            })
        })
        .subscribe(
            (names) => console.log(`RxJs$onNext Names=[${names}]`), // onNext
            (error) => console.log(`RxJs$onError: ${error}`), // onError
            () => {  // onComplete
                console.log(`RxJs$onComplete`)
                bomb.onNext()
            }
        )
}