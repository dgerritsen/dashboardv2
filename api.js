const response = (

  [
    {"Pickings":
      [
        {
        "datetime_start": "1514793600", // 01-01-2018 08:00
        //                 + 3599
        "datetime_end": "1514797199", // 01-01-2018 08:59:59
        "Picked":1,
        "OrdersCount":1
      },
      {
        "datetime_start": "1514797200", // 01-01-2018 09:00
        //                 + 3599
        "datetime_end": "1514800799", // 01-01-2018 09:59:59
        "Picked":1,
        "OrdersCount":1
      },




/* -------------------------------------------
   HTTP GET /api/Reporting/pickings/

   Params:
   - datetime_from?: Show picks with datetime_start > query (timestamp)
   - datetime_to?: Show picks with datetime_end < query (timestamp)

   Returns a list of pickings per hour, with picks and orders of
   all employees added up. Ability to specify datetime range.
   ------------------------------------------- */
[
  {
    // Timestamps (https://www.freeformatter.com/epoch-timestamp-to-date-converter.html)
    // Probably most of the time with 1 hour difference (1h = 3600)
    "datetime_start": 1526961600,
    "datetime_end": 1526965200,
    "picked": 0,
    "orders": 0
  },
  {
    "datetime_start": 1526965200,
    "datetime_end": 1526968800,
    "picked": 140,
    "orders": 80
  }
  // etc...
],

/* -------------------------------------------
   HTTP GET /api/Reporting/employees/
   - or -
   HTTP GET /api/Reporting/pickings/employees/

   No Params

   Returns a list of employees with id
   ------------------------------------------- */
[
  {
    "id": 1,
    "name": "Arjan Kruijer",
    "is_human": true
  },
  {
    "id": 2,
    "name": "Axel Dullemont",
    "is_human": true
  },
  {
    "id": 3,
    "name": "Crossdock",
    "is_human": false
  },
  {
    "id": 4,
    "name": "Systeem",
    "is_human": false
  }
  // etc...
],

/* -------------------------------------------
   HTTP GET /api/Reporting/pickings/employee/$id

   Params:
   - id*: employee id
   - datetime_from?: Show picks with datetime_start > query
   - datetime_to?: Show picks with datetime_end < query

   Returns a list of pickings and orders for the specified user.
   Ability to specify datetime range.
   ------------------------------------------- */
[
  {
    "datetime_start": 1526961600,
    "datetime_end": 1526965200,
    "picked": 0,
    "orders": 0
  },
  {
    "datetime_start": 1526965200,
    "datetime_end": 1526968800,
    "picked": 12,
    "orders": 2
  }
  // etc...
]
/* ------------------------------------------- */
);
