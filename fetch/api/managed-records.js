import fetch from '../util/fetch-fill';
import URI from 'urijs';

window.path = 'http://localhost:3000/records';

// Main Function
const retrieve = (options) => {

  if (options === undefined) {
    options = {};
  };

  // Call query_string
  let queryString = query_string(options, path).toString();
  return fetch(query).then(response => {
    let json = response.json();
    if (response.ok) {
      return json;
    } else {
      return json.then(Promise.reject.bind(Promise));
    }
  })
  // Call getRecords
  .then(response => getRecords(res, options))
  .catch(e => console.log("Error: ", e))
};

// Query Helper
const query_string = (options, url) => {

  let colors = options["colors"] ? options["colors"] : ["red", "brown", "blue", "yellow", "green"];
  let offset = options["page"] ? (options["page"] * 10) - 10 : 0;
  let queryString = URI(url).addSearch("limit", 10).addSearch("offset", offset).addSearch("color[]", colors);

  return queryString;
};

// Return Records Helper
const returnRecords = (resList, options) => {
  
  // Call getRecords and getPages
  return getPages(resList, options).then(res => getRecords(res, resList, options)).catch(e => console.log("Error: ", e));
}

// Get Records Helper
const getRecords = (recordResults, resList, options) => {

  let ids = [];
  let closed = 0;
  let open = [];
  let pgNum = options["page"] || 0;
  let primaryColors = ["red", "blue", "yellow"];

  resList.forEach((element) => {
    ids.push(element["id"]);
    if (element["disposition"] === "open") {
      element ["isPrimary"] = primaryColors.includes(element["color"]);
      open.push(element);
    } else if (element["disposition"] === "closed") {
      if (primaryColors.includes(element["color"]) === true) {
        closed++;
      }
    };
  });
  
  let record = {
    prevPage : recordResults["previous"],
    nextPage : recordResults["next"],
    itemId : ids,
    openItem : open,
    closedItem : closed
  };

  return record;
};

// Get Pages Helper
const getPages = (resList, options) => {

  let colors = options["colors"];
  let currentPage = options["page"] ? options["page"]: 1;
  let previous_page;
  let next_page;
  let  = {
    previous: null,
    next: null
  };

  if (currentPage === 1) {
    previous_page = null;
  // Call getPageNeighbors
  } else {
    previous_page = getPageNeighbors(path,{ page: currentPage - 1, colors: colors}).then(res => page["previous"] = res.length > 0 ? currentPage - 1 : null).catch(e => console.log("Error: ", e));
  };

  if (resList.length < 10) {
    next_page = null
  } else {
    next_page = getPageNeighbors(path, { page: currentPage + 1, colors: colors}).then(res => page["next"] = res.length > 0 ? currentPage + 1 : null).catch(e => console.log("Error: ", e));
  }

  return Promise.all([previous_page, next_page]).then(res => page).catch(e => console.log("Error: ", e));
};

// Get neighboring pages helper
const getPageNeighbors = (path, options) => {

  if (options === undefined) {
    options = {};
  };
  let queryString = query_string(options, path).toString();

  return fetch(queryString).then(res => res.json()).then(res => res).catch(e => console.log("Error: ", e))
}

export default retrieve;