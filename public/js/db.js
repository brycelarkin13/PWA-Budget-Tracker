let db;

const request = indexedDB.open('new_budget', 1);
// event will emit if the database version changes (ex. 1 to 2 or v1 to v2 etc..)
request.onupgradeneeded = function (event) {
    // save reference to the db
    const db = event.target.result;
    // create an object store (table) called 'new_budget', set to have auto increm primary key
    db.createObjectStore('new_budget', { autoIncrement: true });
};

// upon a successful
request.onsuccess = function (event) {
    // when db is successfully created with its object store (from oneupgradeneeded event above)  or simply established a connection, save reference to db in global variable
    db = event.target.result;

    //  // check if app is online, if yes run uploadBudget() function to send all local db data to api
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    // log error here
    console.log('Something went wrong!' + event.target.errorCode);
};

// This function will be executed if we attempt to submit a new record and there's no internet connection
function saveRecord(record) {
    // open new transaction with db with read/write permissions
    const transaction = db.transaction(['new_budget'], 'readwrite');

    // access the object store for 'new_budget'
    const objectStore = transaction.objectStore('new_budget');

    // add record to the store with add method

    objectStore.add(record);
}

function checkDatabase() {
    // open a transaction on your pending db
    const transaction = db.transaction(['new_budget'], 'readwrite');

    // access your pending object store
    const store = transaction.objectStore('new_budget');
    // get all records from store and set to a variable
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => response.json())
                .then(() => {
                    // if successful, open a transaction on your pending db
                    const transaction = db.transaction(['new_budget'], 'readwrite');

                    // access your pending object store
                    const store = transaction.objectStore('new_budget');

                    // clear all items in your store
                    store.clear();
                });
        }
    };
};

// listen for app coming back online
window.addEventListener('online', checkDatabase);