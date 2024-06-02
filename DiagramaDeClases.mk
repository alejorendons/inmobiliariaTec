# Diagrama de Clases

## Clases

### User
- **Atributos:**
  - `username`: String
  - `password`: String
- **Métodos:**
  - `register()`: void
  - `login()`: void

### Famous
- **Atributos:**
  - `name`: String
  - `nationality`: String
  - `birthDate`: Date
- **Métodos:**
  - `addFamous()`: void

### Property
- **Atributos:**
  - `type`: String
  - `location`: Location
  - `description`: String
  - `estimatedPrice`: Number
  - `owner`: User/Famous
  - `forSale`: Boolean
- **Métodos:**
  - `addProperty()`: void

### Location
- **Atributos:**
  - `address`: String
  - `city`: String
  - `country`: String

### Transaction
- **Atributos:**
  - `type`: String
  - `property`: Property
  - `date`: Date
  - `salePrice`: Number
  - `buyer`: User/Famous
  - `seller`: User/Famous
  - `bankId`: Bank
  - `commission`: Number
  - `taxes`: Number
  - `fines`: Number
- **Métodos:**
  - `newTransaction()`: void

### Bank
- **Atributos:**
  - `name`: String
  - `headquartersLocation`: String

### Auction
- **Atributos:**
  - `property`: Property
  - `currentBid`: Number
  - `highestBidder`: User/Famous
  - `bids`: List<Bid>
- **Métodos:**
  - `bid()`: void

### Bid
- **Atributos:**
  - `bidder`: User/Famous
  - `amount`: Number

### Report
- **Métodos:**
  - `generateSalesReport(Date startDate, Date endDate, String famousId)`: void
  - `generateTransactionReport(Date startDate, Date endDate, String famousId)`: void
  - `generateCommissionsReport()`: void
  - `generateFinesReport()`: void
  - `generateTaxesReport()`: void

## Relaciones

- **Property** tiene un `Location`.
- **Property** tiene un `User` o `Famous` como propietario (`owner`).
- **Transaction** tiene un `Property`.
- **Transaction** tiene un `User` o `Famous` como comprador (`buyer`).
- **Transaction** tiene un `User` o `Famous` como vendedor (`seller`).
- **Transaction** tiene un `Bank` como banco (`bankId`).
- **Auction** tiene un `Property`.
- **Auction** tiene un `User` o `Famous` como mejor postor (`highestBidder`).
- **Auction** tiene una lista de `Bid`.
- **Bid** tiene un `User` o `Famous` como postor (`bidder`).
