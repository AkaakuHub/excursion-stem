# Music Separation Game

This project is a music part separation game application that allows users to select local music files, separate them by instrument, and play a guessing game based on the separated tracks. The application is built using Flask for the backend and React with TypeScript for the frontend.

## Project Structure

The project is organized as follows:

```
excursion-stem
├── backend
│   ├── app.py                # Entry point for the Flask application
│   ├── models
│   │   └── demucs_model.py   # Class for handling the Demucs model
│   ├── services
│   │   ├── audio_service.py   # Service for audio file processing
│   │   └── game_service.py    # Service for game logic management
│   ├── utils
│   │   └── audio_processing.py # Utility functions for audio processing
│   ├── requirements.txt       # List of project dependencies
│   └── config.py              # Application configuration management
├── frontend
│   ├── public
│   │   ├── index.html         # HTML template for the React application
│   │   └── favicon.svg        # Application favicon
│   ├── src
│   │   ├── components
│   │   │   ├── AudioPlayer.tsx # Component for audio playback
│   │   │   ├── FileUploader.tsx # Component for uploading audio files
│   │   │   ├── GameInterface.tsx # Component for game interface
│   │   │   └── TrackSelector.tsx # Component for selecting audio range
│   │   ├── pages
│   │   │   ├── HomePage.tsx   # Home page component
│   │   │   └── GamePage.tsx   # Game page component
│   │   ├── services
│   │   │   ├── api.ts         # Service for backend API communication
│   │   │   └── audioProcessing.ts # Functions related to audio processing
│   │   ├── types
│   │   │   └── index.ts       # Type definitions for TypeScript
│   │   ├── App.tsx            # Main component for the React application
│   │   ├── index.tsx          # Entry point for the React application
│   │   └── styles.css         # Application styles
│   ├── package.json           # npm configuration file
│   ├── tsconfig.json          # TypeScript configuration file
│   └── vite.config.ts         # Vite configuration file
├── .gitignore                 # Files and directories to ignore in Git
└── README.md                  # Project documentation
```

## Setup Instructions

1. **Clone the repository**:

    ```
    git clone <repository-url>
    cd excursion-stem
    ```

2. **Backend Setup**:

    - Navigate to the `backend` directory.
    - Install the required Python packages:
        ```
        pip install -r requirements.txt
        ```
    - Run the Flask application:
        ```
        python app.py
        ```

3. **Frontend Setup**:

    - Navigate to the `frontend` directory.
    - Install the required Node.js packages:
        ```
        npm install
        ```
    - Start the development server:
        ```
        npm run dev
        ```

4. **Access the Application**:
    - Open your web browser and go to `http://localhost:3000` to access the application.

## Features

-   Upload local music files.
-   Preview selected audio ranges.
-   Separate audio tracks by instrument using Demucs.
-   Play a guessing game based on the separated tracks.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
