import soccerdata as sd
import json
import logging

logging.basicConfig(level=logging.INFO)

def test_fotmob():
    try:
        print("Initializing FotMob...")
        # FotMob uses league IDs usually, or the generic names
        fotmob = sd.FotMob(leagues="ENG-Premier League", seasons="2023")
        
        print("Reading league table...")
        # FotMob support in soccerdata is limited, mostly for fixtures/match stats
        # Let's see if read_schedule works
        schedule = fotmob.read_schedule()
        print(schedule.head())
        print("Success!")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_fotmob()
