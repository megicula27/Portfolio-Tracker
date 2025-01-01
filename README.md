# 📈 Portfolio Tracker

Portfolio Tracker is a dynamic and feature-rich web application that allows users to manage their stock portfolios efficiently. Whether it's buying, selling, or analyzing stocks, Portfolio Tracker offers a seamless experience powered by real-time data and an intuitive interface.

## 🚀 Features

- **Stock Search**: Search for any stock using live data from Finnhub and Yahoo Finance APIs.
- **Buy Stocks**: Users can buy stocks (**Quantity is set to 1** for simplicity, as per assignment requirements).
- **Portfolio Dashboard**:
  - View portfolio summary at a glance.
  - Weekly graph showcasing portfolio performance.
- **Stock Details**:
  - Analyze the performance of individual stocks.
  - View weekly graphs for individual stocks.
- **Sell Stocks**: Sell any stock dynamically with real-time updates.
- **Dynamic Functionality**: All data is updated dynamically for an immersive user experience.
- **Database**: MongoDB is used to store and manage all user data.
- **API Integration**: Real-time stock data is fetched using **Finnhub** and **Yahoo Finance** APIs.
- **Tech Stack**:
  - **Frontend**: Next.js
  - **Backend**: Next.js (API routes)
  - **Database**: MongoDB
- **Docker Support**: Fully Dockerized application for hassle-free deployment.
- **Hosting**: The application is live and hosted on [Vercel](https://sasta-portfolio-tracker.vercel.app/).

## 🛠️ Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker](https://www.docker.com/)
- [MongoDB Atlas](https://www.mongodb.com/atlas) or a local MongoDB instance
- API keys for [Finnhub](https://finnhub.io/) and [Yahoo Finance](https://finance.yahoo.com/).

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/megicula27/Portfolio-Tracker.git
   cd portfolio-tracker
   ```

2. **Set Environment Variables Create a .env file in the root directory and add the following:**

   ```bash
   FINNHUB_API_KEY=your_finnhub_api_key
   MONGODB_URI=your_mongodb_connection_string
   ```

3. **Install Dependencies**

   ```bash
   npm install
   ```

4. **Run the Application**

   ```bash
   npm run dev
   ```

5. **Docker Setup (Optional) Build and run using Docker:**
   ```bash
   docker-compose up
   ```

## 📊 Portfolio Summary

The dashboard displays:

- **Portfolio Value**: An overview of your investments.
- **Weekly Performance Graph**: Visualize how your portfolio has performed over the last week.
- **Individual Stock Analysis**: Check individual stock performance and weekly graphs.

## 🖥️ Technologies Used

- **Frontend**: Next.js
- **Backend**: Next.js (API routes)
- **Database**: MongoDB
- **APIs**: Finnhub, Yahoo Finance
- **Hosting**: Vercel
- **Containerization**: Docker

## 📂 Project Structure

Here's an overview of the project's folder structure:

```plaintext
portfolio-tracker/
├── public/                # Static assets (images, icons, etc.)
├── src/
│   ├── pages/             # Next.js pages
│   │   ├── api/           # API routes (backend logic)
│   │   ├── index.js       # Main landing page
│   │   └── dashboard.js   # Portfolio dashboard page
│   ├── components/        # Reusable React components
│   ├── styles/            # Global and component-specific styles
│   └── utils/             # Utility functions (e.g., API helpers)
├── .env                   # Environment variables
├── Dockerfile             # Docker configuration for the app
├── docker-compose.yml     # Docker Compose setup
├── package.json           # Project metadata and dependencies
└── README.md              # Project documentation
```

## 🌐 Live Demo

The project is live and hosted on [Vercel](https://vercel.com). Visit the application here: [Portfolio Tracker Live](https://sasta-portfolio-tracker.vercel.app/)

## 📦 Deployment

1. **Deploy on Vercel**:

   - Link your GitHub repository to your Vercel account.
   - Add environment variables on Vercel.
   - Deploy with a single click.

2. **Use Docker for Deployment**:
   ```bash
   docker-compose up --build
   ```

## 🤝 Contribution

Contributions are welcome! If you have any suggestions or issues, feel free to:

- Submit a pull request.
- Raise an issue in the repository.

## 📜 License

This project is licensed under the [MIT License](LICENSE). Feel free to use it for your own purposes.

## ✨ Acknowledgments

Special thanks to:

- [Finnhub](https://finnhub.io/) for providing real-time stock data.
- [Yahoo Finance](https://finance.yahoo.com/) for additional stock insights.
- [Vercel](https://vercel.com/) for seamless hosting and deployment.
