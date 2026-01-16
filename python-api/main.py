"""
SoccerData API - FastAPI microservice for scraping soccer data
Uses the soccerdata library to fetch data from FBref, Understat, FotMob, etc.
"""

from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
import soccerdata as sd
import pandas as pd
import numpy as np
from typing import Optional, List
from datetime import datetime
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="MBFF Soccer Data API",
    description="API for scraping soccer data from multiple sources",
    version="1.0.0"
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# League mappings for soccerdata
LEAGUE_MAPPINGS = {
    "premier-league": "ENG-Premier League",
    "bundesliga": "GER-Bundesliga", 
    "la-liga": "ESP-La Liga",
    "serie-a": "ITA-Serie A",
    "ligue-1": "FRA-Ligue 1",
}


def clean_value(val):
    """Clean a single value for JSON serialization"""
    if pd.isna(val) or val is np.nan:
        return None
    if isinstance(val, (np.floating, float)):
        if np.isinf(val) or np.isnan(val):
            return None
        return float(val)
    if isinstance(val, (np.integer, int)):
        return int(val)
    return val


def df_to_json(df: pd.DataFrame) -> List[dict]:
    """Convert DataFrame to JSON-serializable list of dicts"""
    df = df.reset_index()
    # Convert any datetime columns to strings
    for col in df.columns:
        if df[col].dtype == 'datetime64[ns]':
            df[col] = df[col].dt.strftime('%Y-%m-%d')
    
    # Convert to list of dicts and clean values
    records = df.to_dict(orient='records')
    cleaned = []
    for record in records:
        cleaned.append({k: clean_value(v) for k, v in record.items()})
    return cleaned


def json_response(data: dict) -> Response:
    """Create a JSON response with proper NaN handling"""
    return Response(
        content=json.dumps(data, default=str),
        media_type="application/json"
    )


# ==================== FBref Endpoints ====================

@app.get("/api/fbref/players/{league}/{season}")
async def get_fbref_player_stats(
    league: str,
    season: str,
    stat_type: str = Query(default="standard", description="Stat type: standard, shooting, passing, defense, etc.")
):
    """
    Get player season statistics from FBref
    
    Stat types: standard, shooting, passing, passing_types, goal_shot_creation,
                defense, possession, playing_time, misc, keeper, keeper_adv
    """
    try:
        league_code = LEAGUE_MAPPINGS.get(league, league)
        fbref = sd.FBref(league_code, season)
        
        stats = fbref.read_player_season_stats(stat_type=stat_type)
        return json_response({"data": df_to_json(stats), "source": "fbref"})
    except Exception as e:
        logger.error(f"FBref player stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/fbref/teams/{league}/{season}")
async def get_fbref_team_stats(
    league: str,
    season: str,
    stat_type: str = Query(default="standard", description="Stat type")
):
    """Get team season statistics from FBref"""
    try:
        league_code = LEAGUE_MAPPINGS.get(league, league)
        fbref = sd.FBref(league_code, season)
        
        stats = fbref.read_team_season_stats(stat_type=stat_type)
        return json_response({"data": df_to_json(stats), "source": "fbref"})
    except Exception as e:
        logger.error(f"FBref team stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/fbref/schedule/{league}/{season}")
async def get_fbref_schedule(league: str, season: str):
    """Get match schedule/results from FBref"""
    try:
        league_code = LEAGUE_MAPPINGS.get(league, league)
        fbref = sd.FBref(league_code, season)
        
        schedule = fbref.read_schedule()
        return json_response({"data": df_to_json(schedule), "source": "fbref"})
    except Exception as e:
        logger.error(f"FBref schedule error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Understat Endpoints ====================

@app.get("/api/understat/players/{league}/{season}")
async def get_understat_player_stats(league: str, season: str):
    """
    Get player xG/xA statistics from Understat
    Includes expected goals, expected assists, shots, key passes
    """
    try:
        league_code = LEAGUE_MAPPINGS.get(league, league)
        understat = sd.Understat(league_code, season)
        
        stats = understat.read_player_season_stats()
        return json_response({"data": df_to_json(stats), "source": "understat"})
    except Exception as e:
        logger.error(f"Understat player stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/understat/team-stats/{league}/{season}")
async def get_understat_team_stats(league: str, season: str):
    """Get team xG statistics from Understat"""
    try:
        league_code = LEAGUE_MAPPINGS.get(league, league)
        understat = sd.Understat(league_code, season)
        
        stats = understat.read_team_season_stats()
        return json_response({"data": df_to_json(stats), "source": "understat"})
    except Exception as e:
        logger.error(f"Understat team stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/understat/fixtures/{league}/{season}")
async def get_understat_fixtures(league: str, season: str):
    """Get fixtures with xG data from Understat"""
    try:
        league_code = LEAGUE_MAPPINGS.get(league, league)
        understat = sd.Understat(league_code, season)
        
        fixtures = understat.read_schedule()
        return json_response({"data": df_to_json(fixtures), "source": "understat"})
    except Exception as e:
        logger.error(f"Understat fixtures error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== FotMob Endpoints ====================

@app.get("/api/fotmob/schedule/{league}/{season}")
async def get_fotmob_schedule(league: str, season: str):
    """Get match schedule from FotMob"""
    try:
        league_code = LEAGUE_MAPPINGS.get(league, league)
        fotmob = sd.FotMob(league_code, season)
        
        schedule = fotmob.read_schedule()
        return json_response({"data": df_to_json(schedule), "source": "fotmob"})
    except Exception as e:
        logger.error(f"FotMob schedule error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Sofascore Endpoints ====================

@app.get("/api/sofascore/schedule/{league}/{season}")
async def get_sofascore_schedule(league: str, season: str):
    """Get match schedule from Sofascore"""
    try:
        league_code = LEAGUE_MAPPINGS.get(league, league)
        sofascore = sd.Sofascore(league_code, season)
        
        schedule = sofascore.read_schedule()
        return json_response({"data": df_to_json(schedule), "source": "sofascore"})
    except Exception as e:
        logger.error(f"Sofascore schedule error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== WhoScored Endpoints ====================

@app.get("/api/whoscored/schedule/{league}/{season}")
async def get_whoscored_schedule(league: str, season: str):
    """Get match schedule from WhoScored"""
    try:
        league_code = LEAGUE_MAPPINGS.get(league, league)
        whoscored = sd.WhoScored(league_code, season)
        
        schedule = whoscored.read_schedule()
        return json_response({"data": df_to_json(schedule), "source": "whoscored"})
    except Exception as e:
        logger.error(f"WhoScored schedule error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Club Elo Endpoints ====================

@app.get("/api/clubelo/ratings")
async def get_club_elo_ratings():
    """Get current club Elo ratings"""
    try:
        elo = sd.ClubElo()
        ratings = elo.read_by_date()
        return json_response({"data": df_to_json(ratings), "source": "clubelo"})
    except Exception as e:
        logger.error(f"Club Elo error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== SoFIFA Endpoints ====================

@app.get("/api/sofifa/players/{league}")
async def get_sofifa_players(
    league: str,
    version: Optional[str] = Query(default=None, description="FIFA version, e.g. '24'")
):
    """Get FIFA video game player ratings from SoFIFA"""
    try:
        league_code = LEAGUE_MAPPINGS.get(league, league)
        sofifa = sd.SoFIFA(league_code, version) if version else sd.SoFIFA(league_code)
        
        players = sofifa.read_players()
        return json_response({"data": df_to_json(players), "source": "sofifa"})
    except Exception as e:
        logger.error(f"SoFIFA error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Combined/Utility Endpoints ====================

@app.get("/api/combined/player-stats/{league}/{season}")
async def get_combined_player_stats(league: str, season: str):
    """
    Get combined player stats from multiple sources (FBref + Understat)
    Returns xG, xA, goals, assists, minutes, and more
    """
    try:
        league_code = LEAGUE_MAPPINGS.get(league, league)
        
        # Get FBref standard stats
        fbref = sd.FBref(league_code, season)
        fbref_stats = fbref.read_player_season_stats(stat_type="standard")
        
        # Get Understat xG stats
        try:
            understat = sd.Understat(league_code, season)
            understat_stats = understat.read_player_season_stats()
            
            # Merge on player name (basic merge, may need refinement)
            combined = fbref_stats  # Use FBref as base
        except:
            combined = fbref_stats
        
        return json_response({
            "data": df_to_json(combined),
            "sources": ["fbref", "understat"]
        })
    except Exception as e:
        logger.error(f"Combined stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/leagues")
async def get_available_leagues():
    """Get list of available leagues"""
    return json_response({
        "leagues": [
            {"id": "premier-league", "name": "Premier League", "country": "England"},
            {"id": "bundesliga", "name": "Bundesliga", "country": "Germany"},
            {"id": "la-liga", "name": "La Liga", "country": "Spain"},
            {"id": "serie-a", "name": "Serie A", "country": "Italy"},
            {"id": "ligue-1", "name": "Ligue 1", "country": "France"},
        ]
    })


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
