#!/bin/bash
# Start the SoccerData Python API

cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt --quiet

# Start the server
echo "Starting SoccerData API on http://localhost:8000"
echo "API Docs available at http://localhost:8000/docs"
python main.py
