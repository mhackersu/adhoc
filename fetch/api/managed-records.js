import fetch from '../util/fetch-fill';
import URI from 'urijs';

// records endpoint
window.path = 'http://localhost:3000/records';

// Main Retrieve Function
const retrieve = (options) => {

  if (options === undefined) {
    options = {};
  };

  let queryString = buildQueryString(options, path).toString();

  return fetch(queryString)
    .then(res => {
      let json = res.json();
      if (res.ok) {
        return json;
      } else {
        return json.then(Promise.reject.bind(Promise));
      }
    })
    // call returnRecordsHelper
    .then(res => returnRecordsHelper(res, options))
    .catch(e => console.log('error: ', e))
};

// Set Options
const buildQueryString = (options, url) => {

  let colors = options['colors'] ? options['colors'] : ['red', 'brown', 'blue', 'yellow', 'green'];
  let offset = options['page'] ? (options['page'] * 10) - 10 : 0;

  let queryString = URI(url)
    .addSearch('limit', 10)
    .addSearch('offset', offset)
    .addSearch('color[]', colors);

  return queryString;
};

const returnRecordsHelper = (resList, options) => {

  // call getPagesHelper
  return getPagesHelper(resList, options)
  // call getRecordsHelper
  .then(res => getRecordsHelper(res, resList, options))
  .catch(e => console.log('error: ', e))
}

// Set Dispositions
const getRecordsHelper = (pageResults, resList, options) => {

  let idsArray = [];
  let closedCount = 0;
  let openElements = [];
  let pageNumber = options['page'] || 0;
  const primaryColors = ['red', 'blue', 'yellow'];

  resList.forEach((element) => {

    idsArray.push(element['id']);

    if (element['disposition'] == 'open') {

      element['isPrimary'] = primaryColors.includes(element['color']);
      openElements.push(element);

    } else if (element['disposition'] == 'closed') {

      if (primaryColors.includes(element['color']) == true) {
          closedCount++;
        }
      };
    });

  let recordObject = {
    previousPage : pageResults['previous'],
    nextPage: pageResults['next'],
    ids : idsArray,
    open : openElements,
    closedPrimaryCount: closedCount
  };

  return recordObject;
};

// Pagination
const getPagesHelper = (resList, options) => {

  let colors = options['colors']
  let currentPage = options['page'] ? options['page']: 1;
  let callPreviousPage;
  let callNextPage;
  let pages = {
    previous: null,
    next: null
  };

  if (currentPage == 1) {
    callPreviousPage = null;
  } else {
    // call getPageNeighborsHelper
    callPreviousPage = getPageNeighborsHelper(path,{ page: currentPage - 1, colors: colors })
      .then(res => pages['previous'] = res.length > 0 ? currentPage - 1 : null )
      .catch(e => console.log('error: ', e))
  }

  if (resList.length < 10) {
    callNextPage = null
  } else {
    // call getPageNeighborsHelper
    callNextPage = getPageNeighborsHelper(path, { page: currentPage + 1, colors: colors })
      .then(res => pages['next'] = res.length > 0 ? currentPage + 1 : null )
      .catch(e => console.log('error: ', e))
  }

  return Promise.all([callPreviousPage, callNextPage])
    .then(res => pages)
    .catch(e => console.log('error: ', e))

};

const getPageNeighborsHelper = (path, options={}) => {

  // call buildQueryString
  let queryString = buildQueryString(options, path).toString();

  return fetch(queryString)
    .then(res => res.json())
    .then(res => res)
    .catch(e => console.log('error: ', e))
};

export default retrieve;