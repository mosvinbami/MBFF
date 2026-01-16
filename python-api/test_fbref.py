import soccerdata as sd
import json
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)

def test_fbref():
    try:
        # Initialize FBref scraper for Premier League 2023/24 (since 24/25 might be tricky if season mismatch)
        # Actually user is in 2026. Data might be lacking for 2026 in libraries that aren't updated?
        # Let's try "ENG-Premier League" for Season "2024" (usually means 23/24 or 24/25 depending on source conventions)
        # soccerdata usually treats "2023" as 23/24. 
        # API says "season" string.
        
        print("Initializing FBref...")
        fbref = sd.FBref(leagues="ENG-Premier League", seasons="2324")
        
        print("Reading player season stats...")
        stats = fbref.read_player_season_stats(stat_type="standard")
        print(stats.head())
        print("Success!")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_fbref()
