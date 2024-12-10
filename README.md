# Puzzles - Crossword Game

Puzzles is a simple crossword game designed as a learning project to explore **React** and **Node.js**. The game is still a work in progress, but it features interactive gameplay and customizable options for themes and challenges.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- Customizable crossword puzzles.
- Built-in options for hints, timer, and board reset.
- Topics include music, science, history, and more.
- Dynamic board generation (coming soon).

## Technologies Used

- **Frontend**: React.js
- **Backend**: Node.js

## Installation

1. Clone the repository:
   ```bash
    git clone https://github.com/gildarey/puzzlesGame.git

2. Navigate to the project directory:
   ```bash
   cd puzzlesGame

3. Install the server dependencies:
   ```bash
   cd server
   npm install

4. Install the client dependencies:
   ```bash
   cd ../client
   npm install

5. Create a .env file in the server directory and add the following environment variables:
   ```bash
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_API_URL=your_openai_api_url
   OPENAI_MODEL=your_openai_model
   PORT=5000

6. Create a .env file in the client directory and add any necessary environment variables:  
    ```bash
   REACT_APP_API_URL=your_api_url
   REACT_APP_THEME=dark

7. Start the server:
   ```bash
   cd ../server
   npm start

8. Start the client:
   ```bash
   cd ../client
   npm start

9. Open your browser and navigate to:
   ```bash
   http://localhost:3000

## Usage

- Customize your crossword puzzles by selecting different topics and difficulty levels.
- Use the built-in options for hints, timer, and board reset to enhance your gameplay experience.

## Contributing

Feel free to fork this repository and submit pull requests. Any contributions are welcome!  

## License

This project is licensed under the MIT License.

## Acknowledgements

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [OpenAI](https://openai.com/)

## Contact

- **GitHub**: [gildarey](https://github.com/gildarey)
- **Email**: [gildarey.r@gmail.com](mailto:gildarey.r@gmail.com)
- **LinkedIn**: [Gilda Rey](https://www.linkedin.com/in/gilda-rey/)