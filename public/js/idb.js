let db;

const request = indexedDB.open('budget_tracker', 1);
// event will emit if the database version changes (ex. 1 to 2 or v1 to v2 etc..)
request.onupgradeneeded = function(event) {
    // save reference to the db
    const db = event.target.result;
    // create an object store (table) called 'new_budget', set to have auto increm primary key
    db.createObjectStore('new_budget', { autoIncrement: true });
};

// upon a successful
request.onsuccess = function(event) {
    // when db is successfully created with its object store (from oneupgradeneeded event above)  or simply established a connection, save reference to db in global variable
    db = event.target.result;

    //  // check if app is online, if yes run uploadBudget() function to send all local db data to api
    if (navigator.onLine) {
        // uploadBudget();
    }
};

request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
};

// This function will be executed if we attempt to submit a new pizza and there's no internet connection
function saveRecord(record) {
    // open new transaction with db with read/write permissions
    const transaction = db.transaction(['new_budget'], 'readwrite');

    // access the object store for 'new_budget'
    const budgetObjectStore = transaction.objectStore('new_budget');

    // add record to the store with add method

    budgetObjectStore.add(record);
}