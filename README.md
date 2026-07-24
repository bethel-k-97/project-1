# Betty Car Rental Management System

## About the Project

Betty Car Rental Management System is a full-stack web application developed to simplify the process of renting cars. The system allows customers to browse available vehicles, create rental bookings, and manage their accounts. It also provides an admin dashboard where the administrator can manage cars and customer bookings.

This project was developed using Node.js, Express.js, MongoDB Atlas, HTML, CSS, and JavaScript as part of my software engineering learning and portfolio.

---

## Features

### Customer

* Register and log in
* Browse available cars
* View car details
* Search and filter cars
* Book a car
* View booking history
* Manage personal profile

### Administrator

* Secure admin login
* View dashboard statistics
* Add new cars
* Edit car information
* Delete cars
* View all bookings
* Update booking status

---

## Technologies Used

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JSON Web Token (JWT)
* bcryptjs

### Frontend

* HTML5
* CSS3
* JavaScript (Vanilla)

---

## Project Structure

text
betty-car-rental/
│
├── public/
│   ├── css/
│   ├── js/
│   ├── images/
│   └── *.html
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
│
├── package.json
├── server.js
└── README.md

---

## Installation

Clone the repository

 bash
git clone https://github.com/bethel-k-97/car-rental


Move into the project folder

bash
cd car-rental


Install dependencies

bash
npm install


Create a `.env` file and configure the required environment variables.

Run the database seed

bash
npm run seed


Start the application

bash
npm run dev


The application will be available at

text
http://localhost:5000


---

## Admin Account

The administrator account is created by running the seed script.

The administrator credentials are configured using the environment variables in the `.env` file.

---

## Main Pages

* Home Page
* Car Listing
* Car Details
* Login
* Register
* User Dashboard
* Admin Dashboard
* Contact Page
* About Page

---

## Project Workflow

1. Users register or log in.
2. Users browse available cars.
3. Users select a rental period.
4. A booking request is created.
5. The administrator reviews the booking.
6. The administrator confirms or updates the booking status.
7. Customers can view the updated booking information from their dashboard.

---

## Future Improvements

Some features I plan to add in the future include:

* Online payment integration
* Email notifications
* Image upload for cars
* Password reset
* Booking calendar
* Reports and analytics
* Better search and filtering
* Mobile application

---

## Author

**Bethelhem**

Software Engineering Student

---

## License

This project was developed for learning and portfolio purposes.
