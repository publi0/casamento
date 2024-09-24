# Casamento Gift Registry

This is a custom-built website for Gabriela and Felipe's wedding gift registry. The website allows guests to easily select and purchase gifts for the couple, eliminating the need for high-fee third-party gift registry services.

## Features

- **Gift Selection**: Guests can choose from a variety of gift options, such as contributions towards a romantic dinner, a new kitchen appliance, a weekend getaway, or the couple's honeymoon fund.
- **Secure Payment**: Guests can securely pay for their chosen gifts using PIX, a popular mobile payment method in Brazil. The website generates a QR code for the payment, making the process simple and convenient.
- **Personalized Messaging**: After making a payment, guests receive a personalized thank-you message from Gabriela and Felipe, expressing their gratitude for the generous gift.
- **Contact Information**: Guests can easily find the couple's contact information if they need to reach out for any reason.

## Getting Started

To run the project locally, follow these steps:

1. Clone the repository:

```
git clone https://github.com/username/casamento.git
```

2. Install the required dependencies:

```
cd casamento/service
go mod tidy
```

3. Set the necessary environment variables:

```
export DB_URL="your_database_connection_string"
```

4. Start the Go server:

```
go run main.go
```

The website will be available at `http://localhost:3000`.

## Technologies Used

- **Frontend**:
  - HTML
  - CSS
  - JavaScript
  - qrcode.js library for generating QR codes
- **Backend**:
  - Go programming language
  - go-chi/chi for routing and middleware
  - go-chi/cors for CORS handling
  - go-sql-driver/mysql for MySQL database connection
  - go-chi/render for JSON response handling

## Future Improvements

- Implement a more robust gift management system, allowing the couple to add, edit, and remove gift options.
- Add the ability for guests to leave personalized messages or well-wishes along with their gift.
- Integrate with a payment gateway to handle the financial transactions directly, rather than relying on manual bank transfers.
- Enhance the overall user experience and design of the website.

