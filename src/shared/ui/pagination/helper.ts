const addNumbersInArr = (start: number, end: number): number[] => {
  const result: number[] = []
  for (let i = start; i <= end; i++) {
    result.push(i)
  }
  return result
}

const paginationNumbers = (currentPage: number, lastPage: number) => {
  const result = []

  if (lastPage <= 5 ) {
    result.push(...addNumbersInArr(1, lastPage))
  } else if (lastPage > 5 && currentPage < 5) {
    result.push(...addNumbersInArr(1, 5), 0, lastPage)
  } else if (lastPage > 5 && currentPage >=5 && lastPage - currentPage >=  4) {
    result.push(1,0,...addNumbersInArr(currentPage - 1, currentPage + 1),0,lastPage)
  }  else if (lastPage > 5 && lastPage - currentPage !=  4 && currentPage >=5 ) { 
    result.push(1,0,...addNumbersInArr(lastPage - 4 , lastPage))
  }  else if ( currentPage >5 && lastPage - currentPage <=  3) {
    result.push(1, 0, ...addNumbersInArr(lastPage - 4, lastPage))
  }

  return result
}

export { addNumbersInArr, paginationNumbers };
