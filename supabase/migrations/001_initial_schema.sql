-- ============================================
-- MBFF Database Schema
-- Mosvin Bami Fantasy Football
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE FOOTBALL DATA TABLES
-- ============================================

-- Leagues (5 main leagues: PL, La Liga, Serie A, Bundesliga, Ligue 1)
CREATE TABLE public.leagues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id INTEGER UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  country VARCHAR(50) NOT NULL,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id INTEGER UNIQUE NOT NULL,
  league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  short_name VARCHAR(30),
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id INTEGER UNIQUE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  position VARCHAR(3) NOT NULL CHECK (position IN ('GK', 'DEF', 'MID', 'FWD')),
  price DECIMAL(5,1) NOT NULL DEFAULT 5.0 CHECK (price >= 4.0 AND price <= 15.0),
  photo_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competitions (leagues + domestic cups + continental competitions)
CREATE TABLE public.competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id INTEGER UNIQUE NOT NULL,
  league_id UUID REFERENCES public.leagues(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('LEAGUE', 'CUP', 'CONTINENTAL', 'SUPER_CUP')),
  is_competitive BOOLEAN DEFAULT TRUE,
  season VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id INTEGER UNIQUE NOT NULL,
  competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE,
  home_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  away_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  kickoff_time TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELLED')),
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  has_extra_time BOOLEAN DEFAULT FALSE,
  is_processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gameweeks
CREATE TABLE public.gameweeks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_number INTEGER NOT NULL UNIQUE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  lineup_deadline TIMESTAMPTZ NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  is_finished BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Player Match Stats (raw stats per match)
CREATE TABLE public.player_match_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  minutes_played INTEGER DEFAULT 0 CHECK (minutes_played >= 0 AND minutes_played <= 150),
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  clean_sheet BOOLEAN DEFAULT FALSE,
  saves INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  own_goals INTEGER DEFAULT 0,
  penalty_saved INTEGER DEFAULT 0,
  penalty_missed INTEGER DEFAULT 0,
  fantasy_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, match_id)
);

-- Weekly Scores (aggregated per gameweek)
CREATE TABLE public.weekly_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  gameweek_id UUID REFERENCES public.gameweeks(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  matches_played INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, gameweek_id)
);

-- ============================================
-- USER & SQUAD TABLES
-- ============================================

-- User Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255),
  team_name VARCHAR(100) NOT NULL,
  total_points INTEGER DEFAULT 0,
  overall_rank INTEGER,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Squads (15 players)
CREATE TABLE public.squads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  budget_remaining DECIMAL(5,1) DEFAULT 100.0 CHECK (budget_remaining >= 0),
  is_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Squad Players (15 players per squad)
CREATE TABLE public.squad_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  squad_id UUID REFERENCES public.squads(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  purchase_price DECIMAL(5,1) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(squad_id, player_id)
);

-- Weekly Lineups (11 starters + bench order)
CREATE TABLE public.lineups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  gameweek_id UUID REFERENCES public.gameweeks(id) ON DELETE CASCADE,
  formation VARCHAR(5) NOT NULL DEFAULT '3-4-3' CHECK (formation IN ('3-4-3', '3-5-2', '4-3-3', '4-4-2', '4-5-1', '5-3-2', '5-4-1')),
  is_locked BOOLEAN DEFAULT FALSE,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, gameweek_id)
);

-- Lineup Players (positions 1-11 = starters, 12-15 = bench)
CREATE TABLE public.lineup_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lineup_id UUID REFERENCES public.lineups(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  position_slot INTEGER NOT NULL CHECK (position_slot >= 1 AND position_slot <= 15),
  is_captain BOOLEAN DEFAULT FALSE,
  is_vice_captain BOOLEAN DEFAULT FALSE,
  was_auto_subbed BOOLEAN DEFAULT FALSE,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lineup_id, player_id),
  UNIQUE(lineup_id, position_slot)
);

-- ============================================
-- TRANSFER SYSTEM TABLES
-- ============================================

-- Transfers
CREATE TABLE public.transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  gameweek_id UUID REFERENCES public.gameweeks(id) ON DELETE CASCADE,
  player_out_id UUID REFERENCES public.players(id),
  player_in_id UUID REFERENCES public.players(id),
  is_free BOOLEAN DEFAULT TRUE,
  transfer_cost DECIMAL(5,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transfer Credits (per gameweek)
CREATE TABLE public.transfer_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  gameweek_id UUID REFERENCES public.gameweeks(id) ON DELETE CASCADE,
  credits_available INTEGER DEFAULT 1 CHECK (credits_available >= 0 AND credits_available <= 2),
  credits_used INTEGER DEFAULT 0,
  is_bonus_week BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, gameweek_id)
);

-- ============================================
-- SCORING & LEADERBOARD TABLES
-- ============================================

-- User Gameweek Scores
CREATE TABLE public.user_gameweek_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  gameweek_id UUID REFERENCES public.gameweeks(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  gameweek_rank INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, gameweek_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_players_team ON public.players(team_id);
CREATE INDEX idx_players_position ON public.players(position);
CREATE INDEX idx_players_price ON public.players(price);
CREATE INDEX idx_matches_kickoff ON public.matches(kickoff_time);
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_player_match_stats_player ON public.player_match_stats(player_id);
CREATE INDEX idx_player_match_stats_match ON public.player_match_stats(match_id);
CREATE INDEX idx_weekly_scores_gameweek ON public.weekly_scores(gameweek_id);
CREATE INDEX idx_lineup_players_lineup ON public.lineup_players(lineup_id);
CREATE INDEX idx_user_gameweek_scores_user ON public.user_gameweek_scores(user_id);
CREATE INDEX idx_user_gameweek_scores_gameweek ON public.user_gameweek_scores(gameweek_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squad_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lineup_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gameweek_scores ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Squads: Users can only access their own squad
CREATE POLICY "Users can view own squad" ON public.squads
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own squad" ON public.squads
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create own squad" ON public.squads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Squad Players: Users can only access their own squad players
CREATE POLICY "Users can view own squad players" ON public.squad_players
  FOR SELECT USING (
    squad_id IN (SELECT id FROM public.squads WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can manage own squad players" ON public.squad_players
  FOR ALL USING (
    squad_id IN (SELECT id FROM public.squads WHERE user_id = auth.uid())
  );

-- Lineups: Users can only access their own lineups
CREATE POLICY "Users can view own lineups" ON public.lineups
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own lineups" ON public.lineups
  FOR ALL USING (auth.uid() = user_id);

-- Lineup Players
CREATE POLICY "Users can view own lineup players" ON public.lineup_players
  FOR SELECT USING (
    lineup_id IN (SELECT id FROM public.lineups WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can manage own lineup players" ON public.lineup_players
  FOR ALL USING (
    lineup_id IN (SELECT id FROM public.lineups WHERE user_id = auth.uid())
  );

-- Transfers: Users can only access their own transfers
CREATE POLICY "Users can view own transfers" ON public.transfers
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own transfers" ON public.transfers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transfer Credits
CREATE POLICY "Users can view own transfer credits" ON public.transfer_credits
  FOR SELECT USING (auth.uid() = user_id);

-- User Gameweek Scores: Public read, own write
CREATE POLICY "Scores are viewable by everyone" ON public.user_gameweek_scores
  FOR SELECT USING (true);

-- Public read for football data tables
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gameweeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_match_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leagues are viewable by everyone" ON public.leagues FOR SELECT USING (true);
CREATE POLICY "Teams are viewable by everyone" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Players are viewable by everyone" ON public.players FOR SELECT USING (true);
CREATE POLICY "Competitions are viewable by everyone" ON public.competitions FOR SELECT USING (true);
CREATE POLICY "Matches are viewable by everyone" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Gameweeks are viewable by everyone" ON public.gameweeks FOR SELECT USING (true);
CREATE POLICY "Player stats are viewable by everyone" ON public.player_match_stats FOR SELECT USING (true);
CREATE POLICY "Weekly scores are viewable by everyone" ON public.weekly_scores FOR SELECT USING (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.leagues FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.players FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.competitions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.gameweeks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.player_match_stats FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.weekly_scores FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.squads FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.lineups FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.transfer_credits FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_gameweek_scores FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, team_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'team_name', 'My MBFF Team')
  );
  
  -- Create empty squad for user
  INSERT INTO public.squads (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
