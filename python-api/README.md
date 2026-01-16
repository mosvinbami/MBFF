# SoccerData Python API

A FastAPI microservice that scrapes soccer data from multiple sources using the [soccerdata](https://github.com/probberechts/soccerdata) library.

## Data Sources

| Source | Data Available |
|--------|----------------|
| **FBref** | Player stats, team stats, match schedules |
| **Understat** | xG, xA, shot data, expected stats |
| **FotMob** | Live scores, lineups |
| **Sofascore** | Match stats, player ratings |
| **WhoScored** | Match events, player ratings |
| **SoFIFA** | FIFA video game player attributes |
| **Club Elo** | Team Elo ratings |

## Setup

### Prerequisites
- Python 3.9+

### Installation

```bash
# Navigate to the python-api directory
cd python-api

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate  # On Mac/Linux
# or
.\venv\Scripts\activate   # On Windows

# Install dependencies
pip install -r requirements.txt
```

### Running the API

```bash
# Option 1: Use the start script
chmod +x start.sh
./start.sh

# Option 2: Run directly
source venv/bin/activate
python main.py
```

The API will be available at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### FBref
- `GET /api/fbref/players/{league}/{season}?stat_type=standard` - Player stats
- `GET /api/fbref/teams/{league}/{season}?stat_type=standard` - Team stats  
- `GET /api/fbref/schedule/{league}/{season}` - Match schedule

### Understat
- `GET /api/understat/players/{league}/{season}` - Player xG/xA stats
- `GET /api/understat/team-stats/{league}/{season}` - Team xG stats
- `GET /api/understat/fixtures/{league}/{season}` - Fixtures with xG

### FotMob
- `GET /api/fotmob/schedule/{league}/{season}` - Match schedule

### Other
- `GET /api/clubelo/ratings` - Current club Elo ratings
- `GET /api/sofifa/players/{league}` - FIFA player ratings
- `GET /api/combined/player-stats/{league}/{season}` - Combined stats from multiple sources

### Leagues

Use these league IDs:
- `premier-league` - English Premier League
- `bundesliga` - German Bundesliga
- `la-liga` - Spanish La Liga
- `serie-a` - Italian Serie A
- `ligue-1` - French Ligue 1

### Season Format

Use the ending year of the season. For example:
- `2024` for the 2023/24 season
- `2025` for the 2024/25 season

## Example Usage

```bash
# Get Premier League player stats
curl "http://localhost:8000/api/fbref/players/premier-league/2024?stat_type=standard"

# Get Bundesliga xG stats
curl "http://localhost:8000/api/understat/players/bundesliga/2024"

# Get La Liga fixtures
curl "http://localhost:8000/api/fbref/schedule/la-liga/2024"
```

## From Next.js

```typescript
import { getFbrefPlayerStats, getUnderstatPlayerStats } from '@/lib/soccerdata';

// Get player stats
const stats = await getFbrefPlayerStats('premier-league', '2024', 'standard');

// Get xG data
const xgStats = await getUnderstatPlayerStats('bundesliga', '2024');
```

## Notes

- Data is cached locally by soccerdata to avoid excessive requests
- Some sources may rate limit or require additional configuration
- Web scraping terms of service apply - use responsibly
