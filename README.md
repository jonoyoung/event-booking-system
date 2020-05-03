# Event-Booking-System
 Event booking system from an assignment.
 
## Requirements
* NodeJs
* MySQL server
* npm
 
## Description
This project was an assignment, where we were tasked with creating an event booking system. It was up to us to decide what frameworks and languages we would use. We decided that ‘Nodejs’ would be the most appropriate as the program needed to be fast and with the time frame of the assignment it needed to be easy to setup and create.

The program was created using ‘Nodejs’ with various frameworks. The backend also had an SQL server, mainly because a relational database was more relevant to the specific use case.

The design was very similar to this website (if you couldn’t tell). We wanted something clean and unobtrusive so that it would be easier to mark the assignment.

## Installation
If you would like to install and run this, then the following steps will help.

* Creating the MySQL table will require a MySQL server. Run the 'dbcreate.sql' file located in the 'sql' folder.

* In the current directory (where the 'app.js' file is located) run the following command: ``` npm install ```
(This will install all of the libraries that the app requires to run.)

* Configure the MySQL settings by opening the 'app.js' file and editing the following:
```
const db = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'test',
    database: 'theta'
});
```
* Once the previous step has been completed you can now run the app: ``` node app ```
This starts the server and you can find that server on port 3000. 
You can go to your browser at 'localhost:3000' and the server should be working.
